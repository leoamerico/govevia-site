import 'server-only'

import { z } from 'zod'

import { dbQuery, dbTransaction } from '@/lib/db/postgres'
import { loadProcessCatalog, requireProcessTemplateByKey, type ProcessTemplate } from '@/lib/process/catalog'
import { recordAuditEvent } from '@/lib/portal/auth'

const InstanceStatusSchema = z.enum(['open', 'closed'])
const StepStatusSchema = z.enum(['open', 'done'])

export type ProcessInstanceRow = {
  id: number
  template_key: string
  title: string
  status: z.infer<typeof InstanceStatusSchema>
  created_at: Date
  updated_at: Date
}

export type ProcessStepRow = {
  id: number
  instance_id: number
  step_id: string
  status: z.infer<typeof StepStatusSchema>
  done_at: Date | null
}

export type ProcessArtifactRow = {
  id: number
  instance_id: number
  step_id: string
  artifact_key: string
  title: string
  ref_url: string | null
  ref_text: string | null
  sha256: string | null
  created_at: Date
}

export type ProcessEventRow = {
  id: number
  instance_id: number
  event_type: string
  occurred_at: Date
  actor_type: 'system' | 'admin'
  actor_ref: string | null
  metadata_json: string | null
}

function safeActorRef(value: string): string {
  return z.string().min(1).max(200).parse(value)
}

function safeText(value: string, max: number): string {
  return z.string().min(1).max(max).parse(value.trim())
}

function optionalText(value: string | null | undefined, max: number): string | null {
  if (!value) return null
  const t = value.trim()
  if (!t) return null
  return z.string().max(max).parse(t)
}

function optionalSha256(value: string | null | undefined): string | null {
  if (!value) return null
  const t = value.trim().toLowerCase()
  if (!t) return null
  if (!/^[0-9a-f]{64}$/.test(t)) throw new Error('sha256 must be 64 hex chars')
  return t
}

function toMetadataJson(metadata: unknown): string | null {
  if (typeof metadata === 'undefined') return null
  let s: string
  try {
    s = JSON.stringify(metadata)
  } catch {
    throw new Error('metadata must be JSON-serializable')
  }
  if (s.length > 2000) s = s.slice(0, 2000)
  return s
}

async function insertProcessEvent(
  client: { query: (config: { text: string; values?: unknown[] }) => Promise<{ rowCount: number }> },
  {
    instanceId,
    eventType,
    actorType,
    actorRef,
    metadata,
  }: {
    instanceId: number
    eventType: string
    actorType: 'system' | 'admin'
    actorRef: string | null
    metadata?: unknown
  },
): Promise<void> {
  const meta = toMetadataJson(metadata)
  const res = await client.query({
    text: `
      INSERT INTO portal_process_events (instance_id, event_type, actor_type, actor_ref, metadata_json)
      VALUES ($1, $2, $3, $4, $5)
    `,
    values: [instanceId, eventType, actorType, actorRef, meta],
  })
  if (res.rowCount !== 1) throw new Error('failed to insert process event')
}

export async function bootstrapProcessCatalog(actorRef: string): Promise<{ upserted: number }> {
  const safeActor = safeActorRef(actorRef)

  const catalog = await loadProcessCatalog()

  const upserted = await dbTransaction(async (client) => {
    let count = 0

    for (const tpl of catalog.templates) {
      const templateJson = JSON.stringify(tpl)

      const res = await client.query({
        text: `
          INSERT INTO portal_process_templates (template_key, version, title, template_json, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (template_key) DO UPDATE
            SET version = EXCLUDED.version,
                title = EXCLUDED.title,
                template_json = EXCLUDED.template_json,
                updated_at = NOW()
        `,
        values: [tpl.key, tpl.version, tpl.title, templateJson],
      })

      // rowCount for INSERT .. ON CONFLICT DO UPDATE is 1
      if (res.rowCount === 1) count += 1
    }

    return count
  })

  // Evento global (sem instância) vai para audit trail de portal.
  await recordAuditEvent({
    contactId: null,
    eventType: 'catalog_bootstrapped',
    actorType: 'admin',
    actorRef: safeActor,
    metadata: { scope: 'process', templates: catalog.templates.map((t) => t.key) },
  })

  return { upserted }
}

export async function createProcessInstance(
  templateKey: string,
  title: string,
  actorRef: string,
): Promise<{ instanceId: number }> {
  const tpl = await requireProcessTemplateByKey(templateKey)
  const safeActor = safeActorRef(actorRef)
  const safeTitle = safeText(title, 200)

  return dbTransaction(async (client) => {
    const inserted = await client.query<{ id: number }>({
      text: `
        INSERT INTO portal_process_instances (template_key, title, status, created_by_contact_id, updated_at)
        VALUES ($1, $2, 'open', NULL, NOW())
        RETURNING id
      `,
      values: [tpl.key, safeTitle],
    })

    if (inserted.rowCount !== 1) throw new Error('failed to create process instance')

    const instanceId = inserted.rows[0].id

    for (const step of tpl.steps) {
      const stepRes = await client.query({
        text: `
          INSERT INTO portal_process_steps (instance_id, step_id, status, done_at)
          VALUES ($1, $2, 'open', NULL)
          ON CONFLICT (instance_id, step_id) DO NOTHING
        `,
        values: [instanceId, step.step_id],
      })

      // rowCount can be 0 on conflict
      void stepRes
    }

    await insertProcessEvent(client, {
      instanceId,
      eventType: 'instance_created',
      actorType: 'admin',
      actorRef: safeActor,
      metadata: { template_key: tpl.key, template_version: tpl.version },
    })

    return { instanceId }
  })
}

export async function listProcessInstances({ q, limit }: { q?: string; limit?: number }): Promise<ProcessInstanceRow[]> {
  const safeLimit = Math.min(Math.max(limit ?? 50, 1), 200)
  const query = typeof q === 'string' && q.trim().length > 0 ? `%${q.trim()}%` : null

  const res = await dbQuery<ProcessInstanceRow>({
    text: `
      SELECT id, template_key, title, status, created_at, updated_at
      FROM portal_process_instances
      WHERE ($1::text IS NULL OR title ILIKE $1 OR template_key ILIKE $1)
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    values: [query, safeLimit],
  })

  return res.rows.map((r) => ({
    ...r,
    status: InstanceStatusSchema.parse(r.status),
  }))
}

export async function getProcessInstance(instanceId: number): Promise<{
  instance: ProcessInstanceRow
  template: ProcessTemplate
  steps: ProcessStepRow[]
  artifacts: ProcessArtifactRow[]
  events: ProcessEventRow[]
} | null> {
  if (!Number.isFinite(instanceId) || instanceId <= 0) throw new Error('instanceId is invalid')

  const instRes = await dbQuery<ProcessInstanceRow>({
    text: `
      SELECT id, template_key, title, status, created_at, updated_at
      FROM portal_process_instances
      WHERE id = $1
      LIMIT 1
    `,
    values: [instanceId],
  })

  if (instRes.rowCount === 0) return null

  const instance = instRes.rows[0]
  const status = InstanceStatusSchema.parse(instance.status)

  const template = await requireProcessTemplateByKey(instance.template_key)

  const stepsRes = await dbQuery<ProcessStepRow>({
    text: `
      SELECT id, instance_id, step_id, status, done_at
      FROM portal_process_steps
      WHERE instance_id = $1
      ORDER BY id ASC
    `,
    values: [instanceId],
  })

  const artifactsRes = await dbQuery<ProcessArtifactRow>({
    text: `
      SELECT id, instance_id, step_id, artifact_key, title, ref_url, ref_text, sha256, created_at
      FROM portal_process_artifacts
      WHERE instance_id = $1
      ORDER BY created_at DESC
    `,
    values: [instanceId],
  })

  const eventsRes = await dbQuery<ProcessEventRow>({
    text: `
      SELECT id, instance_id, event_type, occurred_at, actor_type, actor_ref, metadata_json
      FROM portal_process_events
      WHERE instance_id = $1
      ORDER BY occurred_at DESC
      LIMIT 200
    `,
    values: [instanceId],
  })

  return {
    instance: {
      ...instance,
      status,
    },
    template,
    steps: stepsRes.rows.map((r) => ({
      ...r,
      status: StepStatusSchema.parse(r.status),
    })),
    artifacts: artifactsRes.rows,
    events: eventsRes.rows,
  }
}

export async function addArtifact(
  instanceId: number,
  stepId: string,
  artifactKey: string,
  {
    title,
    refUrl,
    refText,
    sha256,
  }: { title: string; refUrl?: string | null; refText?: string | null; sha256?: string | null },
  actorRef: string,
): Promise<void> {
  const safeActor = safeActorRef(actorRef)

  if (!Number.isFinite(instanceId) || instanceId <= 0) throw new Error('instanceId is invalid')
  const safeStepId = safeText(stepId, 100)
  const safeArtifactKey = safeText(artifactKey, 200)
  const safeTitle = safeText(title, 200)

  const safeRefUrl = optionalText(refUrl, 500)
  const safeRefText = optionalText(refText, 500)
  if (!safeRefUrl && !safeRefText) throw new Error('either ref_url or ref_text is required')

  const safeSha = optionalSha256(sha256)

  await dbTransaction(async (client) => {
    await client.query({
      text: `
        INSERT INTO portal_process_artifacts (
          instance_id, step_id, artifact_key, title, ref_url, ref_text, sha256
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (instance_id, artifact_key) DO UPDATE
          SET step_id = EXCLUDED.step_id,
              title = EXCLUDED.title,
              ref_url = EXCLUDED.ref_url,
              ref_text = EXCLUDED.ref_text,
              sha256 = EXCLUDED.sha256
      `,
      values: [instanceId, safeStepId, safeArtifactKey, safeTitle, safeRefUrl, safeRefText, safeSha],
    })

    await insertProcessEvent(client, {
      instanceId,
      eventType: 'artifact_added',
      actorType: 'admin',
      actorRef: safeActor,
      metadata: { step_id: safeStepId, artifact_key: safeArtifactKey },
    })
  })
}

export async function tryCloseStep(instanceId: number, stepId: string, actorRef: string): Promise<void> {
  const safeActor = safeActorRef(actorRef)
  if (!Number.isFinite(instanceId) || instanceId <= 0) throw new Error('instanceId is invalid')
  const safeStepId = safeText(stepId, 100)

  const instanceRes = await dbQuery<{ template_key: string; status: string }>({
    text: `
      SELECT template_key, status
      FROM portal_process_instances
      WHERE id = $1
      LIMIT 1
    `,
    values: [instanceId],
  })

  if (instanceRes.rowCount === 0) throw new Error('process instance not found')

  const instanceStatus = InstanceStatusSchema.parse(instanceRes.rows[0].status)
  if (instanceStatus !== 'open') throw new Error('process instance is closed')

  const tpl = await requireProcessTemplateByKey(instanceRes.rows[0].template_key)
  const step = tpl.steps.find((s) => s.step_id === safeStepId) ?? null
  if (!step) throw new Error('unknown step_id')

  const required = step.required_artifacts
  if (required.length === 0) {
    throw new Error('step has no required artifacts (policy)')
  }

  const artifactsRes = await dbQuery<{ artifact_key: string }>({
    text: `
      SELECT artifact_key
      FROM portal_process_artifacts
      WHERE instance_id = $1
        AND step_id = $2
    `,
    values: [instanceId, safeStepId],
  })

  const present = new Set(artifactsRes.rows.map((r) => r.artifact_key))
  const missing = required.filter((k) => !present.has(k))

  if (missing.length > 0) {
    throw new Error(`missing required artifacts: ${missing.join(', ')}`)
  }

  await dbTransaction(async (client) => {
    const updated = await client.query({
      text: `
        UPDATE portal_process_steps
        SET status = 'done', done_at = NOW()
        WHERE instance_id = $1
          AND step_id = $2
          AND status = 'open'
      `,
      values: [instanceId, safeStepId],
    })

    if (updated.rowCount !== 1) {
      throw new Error('step is not open')
    }

    await insertProcessEvent(client, {
      instanceId,
      eventType: 'step_closed',
      actorType: 'admin',
      actorRef: safeActor,
      metadata: { step_id: safeStepId },
    })
  })
}

export async function closeProcess(instanceId: number, actorRef: string): Promise<void> {
  const safeActor = safeActorRef(actorRef)
  if (!Number.isFinite(instanceId) || instanceId <= 0) throw new Error('instanceId is invalid')

  await dbTransaction(async (client) => {
    const stepsRes = await client.query<{ status: string }>({
      text: `
        SELECT status
        FROM portal_process_steps
        WHERE instance_id = $1
      `,
      values: [instanceId],
    })

    if (stepsRes.rowCount === 0) throw new Error('process instance not found')

    const allDone = stepsRes.rows.every((r) => StepStatusSchema.parse(r.status) === 'done')
    if (!allDone) throw new Error('process has open steps')

    const updated = await client.query({
      text: `
        UPDATE portal_process_instances
        SET status = 'closed', updated_at = NOW()
        WHERE id = $1
          AND status = 'open'
      `,
      values: [instanceId],
    })

    if (updated.rowCount !== 1) throw new Error('process already closed')

    await insertProcessEvent(client, {
      instanceId,
      eventType: 'process_closed',
      actorType: 'admin',
      actorRef: safeActor,
      metadata: {},
    })
  })
}
