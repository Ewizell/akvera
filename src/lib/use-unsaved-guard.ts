'use client'

import { useCallback, useRef } from 'react'
import type { SyntheticEvent } from 'react'

function serialize(form: HTMLFormElement) {
  return JSON.stringify(
    Array.from(new FormData(form).entries()).map(([key, value]) =>
      typeof value === 'string'
        ? [key, value]
        : [
            key,
            value.name
              ? `${value.name}:${value.size}:${value.lastModified}`
              : '',
          ]
    )
  )
}

export function useUnsavedGuard() {
  const baselines = useRef(new Map<HTMLFormElement, string>())

  const remember = useCallback((event: SyntheticEvent) => {
    const form = (event.target as HTMLElement).closest?.('form')

    if (form && !baselines.current.has(form)) {
      baselines.current.set(form, serialize(form))
    }
  }, [])

  const isDirty = useCallback(() => {
    for (const [form, baseline] of baselines.current) {
      if (!form.isConnected) {
        baselines.current.delete(form)
        continue
      }

      if (serialize(form) !== baseline) return true
    }

    return false
  }, [])

  return {
    isDirty,
    captureProps: {
      onFocusCapture: remember,
      onPointerDownCapture: remember,
      onKeyDownCapture: remember,
    },
  }
}