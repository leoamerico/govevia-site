import fs from 'node:fs'
import path from 'node:path'
import { remark } from 'remark'
import html from 'remark-html'

const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')

export function getChangelogMeta(): { updatedAt: string | null } {
  if (!fs.existsSync(changelogPath)) return { updatedAt: null }
  const stat = fs.statSync(changelogPath)
  const updatedAt = stat?.mtime ? new Date(stat.mtime).toISOString() : null
  return { updatedAt }
}

export async function getChangelogHtml(): Promise<string> {
  if (!fs.existsSync(changelogPath)) return ''
  const raw = fs.readFileSync(changelogPath, 'utf8')
  const processed = await remark().use(html, { sanitize: false }).process(raw)
  return processed.toString()
}
