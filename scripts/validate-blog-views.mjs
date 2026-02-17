#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

// Reusa o guardrail existente para ViewBlocks (Limites + Evidências + links).
const r = spawnSync(process.execPath, ['scripts/verify-mdx-viewblocks.mjs'], { stdio: 'inherit' })
process.exit(r.status ?? 1)
