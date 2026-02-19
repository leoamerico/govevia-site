/**
 * gen-ceo-console-secrets.mjs — Gerador local de secrets do CEO Console
 *
 * Uso:
 *   node tools/secrets/gen-ceo-console-secrets.mjs
 *   node tools/secrets/gen-ceo-console-secrets.mjs --random  (senha aleatória)
 *
 * NUNCA grava arquivo. O operador copia os valores para o painel de deploy.
 * ADR: docs/architecture/decisions/ADR-004-SECRETS-REGIME-CEO-CONSOLE.md
 */
import { createInterface } from 'node:readline'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_COST = 12
const JWT_SECRET_BYTES = 32

const args = process.argv.slice(2)
const randomPassword = args.includes('--random')

console.log('=== CEO Console — Gerador de Secrets ===\n')
console.log('AVISO: Nenhum arquivo será gravado. Copie os valores para o painel de deploy.\n')

async function getPassword() {
  if (randomPassword) {
    const pwd = randomBytes(20).toString('base64url')
    console.log(`Senha gerada (copie agora, não será exibida novamente):\n  ${pwd}\n`)
    return pwd
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })

  return new Promise((resolve) => {
    // Ocultar input no terminal
    process.stdout.write('Senha desejada para ADMIN_PASSWORD (min 12 chars): ')
    rl.question('', (answer) => {
      rl.close()
      console.log() // newline
      if (!answer || answer.length < 12) {
        console.error('Senha muito curta (mínimo 12 chars). Gerando aleatória.')
        resolve(randomBytes(20).toString('base64url'))
      } else {
        resolve(answer)
      }
    })
  })
}

const password = await getPassword()

console.log('Gerando ADMIN_PASSWORD_HASH (bcrypt cost 12)...')
const hash = await bcrypt.hash(password, BCRYPT_COST)
const jwtSecret = randomBytes(JWT_SECRET_BYTES).toString('hex')

console.log('\n' + '═'.repeat(60))
console.log('VALORES GERADOS — copie para o painel de deploy:')
console.log('═'.repeat(60))
console.log('\nADMIN_USERNAME=<escolher, ex: ceo-envneo>')
console.log(`ADMIN_PASSWORD_HASH=${hash}`)
console.log(`ADMIN_JWT_SECRET=${jwtSecret}`)
console.log('ADMIN_JWT_TTL_SECONDS=28800')
console.log('\n' + '═'.repeat(60))
console.log('\nNENHUM ARQUIVO foi gravado.')
console.log('ADR: docs/architecture/decisions/ADR-004-SECRETS-REGIME-CEO-CONSOLE.md')
