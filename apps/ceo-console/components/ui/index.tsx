'use client'

/**
 * components/ui/index.tsx
 * Shared inline-style UI primitives for the CEO Console admin.
 * No Tailwind — pure CSS-in-JS, consistent with existing manager style.
 */

import { useEffect, type CSSProperties, type ReactNode } from 'react'

// ─── Design tokens ────────────────────────────────────────────────────────────

export const tokens = {
  btnPrimary:   { background: '#0059B3', color: '#fff', border: 'none', borderRadius: 6, padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' } as CSSProperties,
  btnSecondary: { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' } as CSSProperties,
  btnDanger:    { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 6, padding: '0.35rem 0.7rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' } as CSSProperties,
  btnGhost:     { background: 'transparent', color: '#94a3b8', border: '1px dashed #475569', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' } as CSSProperties,
  card:         { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as CSSProperties,
  label:        { display: 'block', fontSize: '0.73rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' } as CSSProperties,
  input:        { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const } as CSSProperties,
  select:       { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const } as CSSProperties,
  textarea:     { width: '100%', border: '1px solid #cbd5e1', borderRadius: 5, padding: '0.4rem 0.65rem', fontSize: '0.83rem', color: '#1e293b', background: '#fff', boxSizing: 'border-box' as const, resize: 'vertical' as const } as CSSProperties,
  field:        { marginBottom: '0.85rem' } as CSSProperties,
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' } as CSSProperties,
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' } as CSSProperties,
  divider:      { border: 'none', borderTop: '1px solid #f1f5f9', margin: '1.25rem 0' } as CSSProperties,
  sectionLabel: { fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.65rem', display: 'block' } as CSSProperties,
  overlay:      { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' } as CSSProperties,
  modal:        { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' as const, padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' } as CSSProperties,
  modalTitle:   { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', fontFamily: 'Georgia, serif', margin: '0 0 1.5rem 0' } as CSSProperties,
  idBadge:      { fontFamily: 'monospace', fontSize: '0.72rem', color: '#0059B3', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '0.1rem 0.45rem', marginRight: '0.5rem' } as CSSProperties,
  emptyState:   { textAlign: 'center' as const, padding: '3rem', color: '#94a3b8', fontSize: '0.9rem' } as CSSProperties,
  page:         { padding: '2rem', fontFamily: "'Open Sans', sans-serif", maxWidth: 1100, margin: '0 auto' } as CSSProperties,
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' } as CSSProperties,
  title:        { fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'Georgia, serif', margin: 0 } as CSSProperties,
  subtitle:     { fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' } as CSSProperties,
}

// ─── Btn ──────────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const BTN_STYLES: Record<BtnVariant, CSSProperties> = {
  primary:   tokens.btnPrimary,
  secondary: tokens.btnSecondary,
  danger:    tokens.btnDanger,
  ghost:     tokens.btnGhost,
}

interface BtnProps {
  variant?: BtnVariant
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: CSSProperties
  title?: string
  children: ReactNode
}

export function Btn({ variant = 'secondary', onClick, disabled, type = 'button', style, title, children }: BtnProps) {
  return (
    <button
      style={{ ...BTN_STYLES[variant], opacity: disabled ? 0.6 : 1, ...style }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      title={title}
    >
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...tokens.card, ...style }}>{children}</div>
}

// ─── Modal ───────────────────────────────────────────────────────────────────
// Includes Escape key handler, overlay-click-to-close, and aria-modal.

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  maxWidth?: number
  style?: CSSProperties
  children: ReactNode
}

export function Modal({ open, onClose, title, maxWidth = 720, style, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={tokens.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ ...tokens.modal, maxWidth, ...style }}>
        {title && <h2 style={tokens.modalTitle}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...tokens.field, ...style }}>{children}</div>
}

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <label style={tokens.label}>
      {children}
      {hint && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '0.4rem', textTransform: 'none', fontSize: '0.68rem' }}>{hint}</span>}
    </label>
  )
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement> & { style?: CSSProperties }) {
  const { style, ...rest } = props
  return <input style={{ ...tokens.input, ...style }} {...rest} />
}

// ─── FieldSelect ──────────────────────────────────────────────────────────────

export function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { style?: CSSProperties }) {
  const { style, children, ...rest } = props
  return <select style={{ ...tokens.select, ...style }} {...rest}>{children}</select>
}

// ─── FieldTextarea ────────────────────────────────────────────────────────────

export function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { style?: CSSProperties }) {
  const { style, ...rest } = props
  return <textarea style={{ ...tokens.textarea, ...style }} {...rest} />
}

// ─── IdBadge ──────────────────────────────────────────────────────────────────

export function IdBadge({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ ...tokens.idBadge, ...style }}>{children}</span>
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ children }: { children: ReactNode }) {
  return <div style={tokens.emptyState}>{children}</div>
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: ReactNode }) {
  return <span style={tokens.sectionLabel}>{children}</span>
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ style }: { style?: CSSProperties } = {}) {
  return <hr style={{ ...tokens.divider, ...style }} />
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={tokens.header}>
      <div>
        <h1 style={tokens.title}>{title}</h1>
        {subtitle && <p style={tokens.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      background: type === 'ok' ? '#166534' : '#991b1b',
      color: '#fff', borderRadius: 8, padding: '0.75rem 1.25rem',
      fontSize: '0.82rem', fontWeight: 600, zIndex: 200,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {msg}
    </div>
  )
}
