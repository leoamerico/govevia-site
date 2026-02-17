'use client'

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export type ViewId = string
export type CtxId = string

type BlockSpec = {
  key: string
  view?: ViewId
  ctx?: CtxId
  canonical: boolean
}

type Mode = 'canonical' | 'view' | 'viewctx'

type ViewState = {
  activeView?: ViewId
  activeCtx?: CtxId
  mode: Mode
  registerBlock: (spec: BlockSpec) => void
  shouldRender: (spec: BlockSpec) => boolean
}

const Ctx = createContext<ViewState | null>(null)

function computeMode(activeView: string | undefined, activeCtx: string | undefined, registry: BlockSpec[]): Mode {
  if (!activeView) return 'canonical'

  const hasViewOnly = registry.some((b) => b.view === activeView && !b.ctx && !b.canonical)
  const hasViewCtx = !!activeCtx && registry.some((b) => b.view === activeView && b.ctx === activeCtx)

  if (hasViewCtx) return 'viewctx'
  if (hasViewOnly) return 'view'
  return 'canonical'
}

export function ViewProvider({
  children,
  activeView,
  activeCtx,
}: {
  children: React.ReactNode
  activeView?: string
  activeCtx?: string
}) {
  const [registry, setRegistry] = useState<BlockSpec[]>([])

  const registerBlock = useCallback((spec: BlockSpec) => {
    setRegistry((prev) => {
      if (prev.some((p) => p.key === spec.key)) return prev
      return [...prev, spec]
    })
  }, [])

  const mode = useMemo(() => computeMode(activeView, activeCtx, registry), [activeView, activeCtx, registry])

  const shouldRender = useCallback(
    (spec: BlockSpec) => {
      if (mode === 'canonical') return spec.canonical
      if (mode === 'view') return !!activeView && spec.view === activeView && !spec.ctx && !spec.canonical
      if (mode === 'viewctx') return !!activeView && !!activeCtx && spec.view === activeView && spec.ctx === activeCtx
      return false
    },
    [mode, activeView, activeCtx]
  )

  // Scroll to the selected block once the mode is known (no hash; query-param driven).
  useEffect(() => {
    if (mode === 'canonical') return
    const id = mode === 'viewctx' ? `vb-${activeView}-${activeCtx}` : `vb-${activeView}`
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [mode, activeView, activeCtx])

  const value: ViewState = useMemo(
    () => ({ activeView, activeCtx, mode, registerBlock, shouldRender }),
    [activeView, activeCtx, mode, registerBlock, shouldRender]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useViewState(): ViewState {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useViewState must be used within <ViewProvider>')
  return v
}
