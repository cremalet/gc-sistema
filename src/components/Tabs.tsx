'use client'

import { useState, type ReactNode } from 'react'

type Tab = {
  value: string
  label: string
  content: ReactNode
}

type TabsProps = {
  tabs: readonly Tab[]
  defaultValue?: string
}

/**
 * Abas simples controladas por estado local. Todas as abas são renderizadas
 * na árvore — escondemos as inativas com `hidden`. Se alguma aba tiver conteúdo
 * pesado, considerar troca pra render condicional no futuro.
 */
export default function Tabs({ tabs, defaultValue }: TabsProps) {
  const initial = defaultValue ?? tabs[0]?.value ?? ''
  const [active, setActive] = useState(initial)

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => {
            const isActive = active === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.value)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          hidden={active !== tab.value}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
