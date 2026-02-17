'use client'

import React, { useEffect, useId } from 'react'
import { useViewState } from './ViewProvider'

export interface ViewBlockProps {
  view?: string
  ctx?: string
  children: React.ReactNode
}

export default function ViewBlock({ view, ctx, children }: ViewBlockProps) {
  const { activeView, activeCtx, mode, registerBlock, shouldRender } = useViewState()
  const reactId = useId()

  const canonical = !view && !ctx
  const key = `${view || 'canonical'}|${ctx || 'any'}|${reactId}`

  useEffect(() => {
    registerBlock({ key, view, ctx, canonical })
  }, [registerBlock, key, view, ctx, canonical])

  const visible = shouldRender({ key, view, ctx, canonical })
  if (!visible) return null

  const id = canonical ? undefined : ctx ? `vb-${view}-${ctx}` : `vb-${view}`
  const isActive = mode === 'viewctx'
    ? !!view && !!ctx && view === activeView && ctx === activeCtx
    : mode === 'view'
      ? !!view && !ctx && view === activeView
      : false

  return (
    <section id={id} data-view={view || 'canonical'} data-ctx={ctx || 'any'} aria-current={isActive ? 'true' : undefined}>
      {children}
    </section>
  )
}
