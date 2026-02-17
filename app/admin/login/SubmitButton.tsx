'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn-primary w-full" disabled={pending} aria-disabled={pending}>
      {pending ? 'Entrando…' : label}
    </button>
  )
}
