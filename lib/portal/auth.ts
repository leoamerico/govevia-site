import 'server-only'

import crypto from 'node:crypto'

import { dbQuery, dbTransaction } from '@/lib/db/postgres'

type PortalContact = {
  id: number
  email: string
  status: 'active' | 'disabled'
}

type ActorType = 'system' | 'admin' | 'contact'

type AuditEventInput = {
  contactId?: number | null
  eventType: string
  actorType: ActorType
  actorRef?: string | null
  metadata?: unknown
}

type IssueLoginTokenContext = {
  expiresAt: Date
  ip?: string | null
  userAgent?: string | null
}

type RecordConsentContext = {
  actorType: ActorType
  actorRef?: string | null
  source?: string | null
}

export function normalizeEmail(email: string): string {
  if (typeof email !== 'string') throw new Error('email must be a string')
  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new Error('email is required')
  if (!normalized.includes('@')) throw new Error('email is invalid')
  return normalized
}

export function hashSha256Hex(value: string | Buffer): string {
  const buf = typeof value === 'string' ? Buffer.from(value, 'utf8') : value
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function requireSha256Hex(value: string, name: string): string {
  if (!/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${name} must be sha256 hex`) 
  }
  return value
}

function normalizeUserAgent(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length <= 200 ? trimmed : trimmed.slice(0, 200)
}

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  const contactId = typeof input.contactId === 'number' ? input.contactId : null
  const eventType = typeof input.eventType === 'string' && input.eventType.trim() ? input.eventType.trim() : null
  const actorType = input.actorType
  const actorRef = typeof input.actorRef === 'string' && input.actorRef.trim() ? input.actorRef.trim().slice(0, 200) : null

  if (!eventType) throw new Error('eventType is required')
  if (actorType !== 'system' && actorType !== 'admin' && actorType !== 'contact') {
    throw new Error('actorType is invalid')
  }

  let metadataJson: string | null = null
  if (typeof input.metadata !== 'undefined') {
    try {
      metadataJson = JSON.stringify(input.metadata)
    } catch {
      throw new Error('metadata must be JSON-serializable')
    }
    if (metadataJson.length > 2000) {
      metadataJson = metadataJson.slice(0, 2000)
    }
  }

  await dbQuery(
    {
      text: `
        INSERT INTO portal_audit_events (contact_id, event_type, actor_type, actor_ref, metadata_json)
        VALUES ($1, $2, $3, $4, $5)
      `,
      values: [contactId, eventType, actorType, actorRef, metadataJson],
    },
  )
}

export async function ensureContactByEmail(email: string): Promise<PortalContact> {
  const normalized = normalizeEmail(email)

  return dbTransaction(async (client) => {
    const res = await client.query<PortalContact>(
      {
        text: `
          INSERT INTO portal_contacts (email, status, updated_at)
          VALUES ($1, 'active', NOW())
          ON CONFLICT ((lower(email))) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW()
          RETURNING id, email, status
        `,
        values: [normalized],
      },
    )

    if (res.rowCount !== 1) {
      throw new Error('failed to ensure contact')
    }

    const contact = res.rows[0]
    if (contact.status !== 'active') {
      throw new Error('contact is disabled')
    }

    return contact
  })
}

export async function issueLoginToken(contactId: number, ctx: IssueLoginTokenContext): Promise<{ token: string }> {
  if (!Number.isFinite(contactId) || contactId <= 0) throw new Error('contactId is invalid')
  if (!(ctx.expiresAt instanceof Date) || Number.isNaN(ctx.expiresAt.getTime())) throw new Error('expiresAt is invalid')

  const now = Date.now()
  if (ctx.expiresAt.getTime() <= now) throw new Error('expiresAt must be in the future')

  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = requireSha256Hex(hashSha256Hex(token), 'tokenHash')

  const createdIpHash = ctx.ip ? requireSha256Hex(hashSha256Hex(ctx.ip), 'createdIpHash') : null
  const createdUserAgent = normalizeUserAgent(ctx.userAgent)

  await dbTransaction(async (client) => {
    const inserted = await client.query<{ id: number }>(
      {
        text: `
          INSERT INTO portal_sessions (
            contact_id, kind, token_hash, token_expires_at, created_ip_hash, created_user_agent
          )
          VALUES ($1, 'login_token', $2, $3, $4, $5)
          RETURNING id
        `,
        values: [contactId, tokenHash, ctx.expiresAt, createdIpHash, createdUserAgent],
      },
    )

    if (inserted.rowCount !== 1) throw new Error('failed to issue token')

    await client.query(
      {
        text: `
          INSERT INTO portal_audit_events (contact_id, event_type, actor_type, actor_ref, metadata_json)
          VALUES ($1, $2, $3, $4, $5)
        `,
        values: [contactId, 'login_token_issued', 'system', null, null],
      },
    )
  })

  return { token }
}

export async function validateAndConsumeLoginToken(token: string): Promise<{ contactId: number }> {
  if (typeof token !== 'string') throw new Error('token must be a string')
  const trimmed = token.trim()
  if (!trimmed) throw new Error('token is required')

  const tokenHash = requireSha256Hex(hashSha256Hex(trimmed), 'tokenHash')

  return dbTransaction(async (client) => {
    const res = await client.query<{
      session_id: number
      contact_id: number
      token_expires_at: Date
      token_used_at: Date | null
      contact_status: 'active' | 'disabled'
    }>(
      {
        text: `
          SELECT s.id as session_id,
                 s.contact_id,
                 s.token_expires_at,
                 s.token_used_at,
                 c.status as contact_status
          FROM portal_sessions s
          JOIN portal_contacts c ON c.id = s.contact_id
          WHERE s.kind = 'login_token'
            AND s.token_hash = $1
          LIMIT 1
          FOR UPDATE
        `,
        values: [tokenHash],
      },
    )

    if (res.rowCount === 0) throw new Error('invalid token')

    const row = res.rows[0]
    if (row.contact_status !== 'active') throw new Error('contact is disabled')
    if (row.token_used_at) throw new Error('token already used')
    if (!(row.token_expires_at instanceof Date) || Number.isNaN(row.token_expires_at.getTime())) {
      throw new Error('invalid token expiry')
    }
    if (row.token_expires_at.getTime() <= Date.now()) throw new Error('token expired')

    const updated = await client.query(
      {
        text: `
          UPDATE portal_sessions
          SET token_used_at = NOW()
          WHERE id = $1
            AND token_used_at IS NULL
        `,
        values: [row.session_id],
      },
    )

    if (updated.rowCount !== 1) throw new Error('token already used')

    await client.query(
      {
        text: `
          INSERT INTO portal_audit_events (contact_id, event_type, actor_type, actor_ref, metadata_json)
          VALUES ($1, $2, $3, $4, $5)
        `,
        values: [row.contact_id, 'login_token_consumed', 'contact', null, null],
      },
    )

    return { contactId: row.contact_id }
  })
}

export async function recordConsent(
  contactId: number,
  consentType: string,
  status: 'granted' | 'revoked',
  ctx: RecordConsentContext,
): Promise<void> {
  if (!Number.isFinite(contactId) || contactId <= 0) throw new Error('contactId is invalid')
  if (typeof consentType !== 'string' || !consentType.trim()) throw new Error('consentType is required')
  if (status !== 'granted' && status !== 'revoked') throw new Error('status is invalid')
  if (ctx.actorType !== 'system' && ctx.actorType !== 'admin' && ctx.actorType !== 'contact') {
    throw new Error('actorType is invalid')
  }

  const safeType = consentType.trim().slice(0, 200)
  const safeSource = typeof ctx.source === 'string' && ctx.source.trim() ? ctx.source.trim().slice(0, 200) : null

  await dbTransaction(async (client) => {
    if (status === 'granted') {
      await client.query(
        {
          text: `
            INSERT INTO portal_consents (contact_id, consent_type, status, granted_at, revoked_at, source)
            VALUES ($1, $2, 'granted', NOW(), NULL, $3)
            ON CONFLICT (contact_id, consent_type) DO UPDATE
              SET status = 'granted',
                  granted_at = NOW(),
                  revoked_at = NULL,
                  source = EXCLUDED.source
          `,
          values: [contactId, safeType, safeSource],
        },
      )

      await client.query(
        {
          text: `
            INSERT INTO portal_audit_events (contact_id, event_type, actor_type, actor_ref, metadata_json)
            VALUES ($1, $2, $3, $4, $5)
          `,
          values: [contactId, 'consent_granted', ctx.actorType, ctx.actorRef ?? null, null],
        },
      )

      return
    }

    await client.query(
      {
        text: `
          INSERT INTO portal_consents (contact_id, consent_type, status, granted_at, revoked_at, source)
          VALUES ($1, $2, 'revoked', NULL, NOW(), $3)
          ON CONFLICT (contact_id, consent_type) DO UPDATE
            SET status = 'revoked',
                revoked_at = NOW(),
                source = EXCLUDED.source
        `,
        values: [contactId, safeType, safeSource],
      },
    )

    await client.query(
      {
        text: `
          INSERT INTO portal_audit_events (contact_id, event_type, actor_type, actor_ref, metadata_json)
          VALUES ($1, $2, $3, $4, $5)
        `,
        values: [contactId, 'consent_revoked', ctx.actorType, ctx.actorRef ?? null, null],
      },
    )
  })
}
