/**
 * lib/auth/constants.ts — Constantes de autenticação por ambiente
 *
 * Cookie name varia por ambiente para permitir HTTP em dev sem quebrar
 * o prefixo __Host- (que exige Secure + Path=/ + sem Domain).
 *
 * ADR: docs/architecture/decisions/ADR-004-SECRETS-REGIME-CEO-CONSOLE.md
 */

/**
 * Nome do cookie de sessão admin.
 * - produção: "__Host-gv_admin" (requer Secure, Path=/, sem Domain)
 * - dev/local: "gv_admin_dev" (sem restrições de prefixo, funciona em HTTP)
 */
export const ADMIN_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-gv_admin' : 'gv_admin_dev'
