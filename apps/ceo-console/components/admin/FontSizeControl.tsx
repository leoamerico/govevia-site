'use client'

import { useEffect, useState } from 'react'

const SIZES = [12, 13, 14, 15, 16, 18] // px values for html font-size
const DEFAULT_IDX = 2                    // 14px default
const LS_KEY = 'ceo-console-fontsize'

export function FontSizeControl() {
  const [idx, setIdx] = useState(DEFAULT_IDX)

  // Restore persisted preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved !== null) {
      const n = Number(saved)
      const found = SIZES.indexOf(n)
      if (found !== -1) {
        setIdx(found)
        document.documentElement.style.fontSize = n + 'px'
      }
    }
  }, [])

  function apply(nextIdx: number) {
    const px = SIZES[nextIdx]
    setIdx(nextIdx)
    document.documentElement.style.fontSize = px + 'px'
    localStorage.setItem(LS_KEY, String(px))
  }

  const btnBase: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: 4,
    color: '#94a3b8',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0.15rem 0.4rem',
    fontFamily: 'monospace',
    transition: 'color 0.15s, border-color 0.15s',
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
      title={`Tamanho do texto: ${SIZES[idx]}px`}
    >
      <button
        style={{ ...btnBase, fontSize: '0.65rem', opacity: idx === 0 ? 0.35 : 1 }}
        disabled={idx === 0}
        onClick={() => apply(idx - 1)}
        aria-label="Diminuir texto"
      >
        A−
      </button>
      <span style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'monospace', minWidth: '2ch', textAlign: 'center' }}>
        {SIZES[idx]}
      </span>
      <button
        style={{ ...btnBase, fontSize: '0.75rem', opacity: idx === SIZES.length - 1 ? 0.35 : 1 }}
        disabled={idx === SIZES.length - 1}
        onClick={() => apply(idx + 1)}
        aria-label="Aumentar texto"
      >
        A+
      </button>
    </div>
  )
}
