import fs from 'node:fs'
import path from 'node:path'
import { remark } from 'remark'
import html from 'remark-html'

const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')

export async function getChangelogHtml(): Promise<string> {
  if (!fs.existsSync(changelogPath)) return ''
  const raw = fs.readFileSync(changelogPath, 'utf8')
  const processed = await remark().use(html, { sanitize: false }).process(raw)
  return processed.toString()
}
