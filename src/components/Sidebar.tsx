'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getMenuItemsForPerfil, SETTINGS_ITEM, type MenuItem } from '@/lib/nav'
import type { Perfil } from '@/lib/types'

type SidebarProps = {
  perfil: Perfil
}

export default function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()
  const items = getMenuItemsForPerfil(perfil)

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="w-9 h-9 rounded-md bg-gray-900 shrink-0"
          />
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            Gestão de
            <br />
            Contratos
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      {perfil === 'admin' && (
        <div className="px-3 py-3 border-t border-gray-200">
          <NavLink item={SETTINGS_ITEM} pathname={pathname} />
        </div>
      )}
    </aside>
  )
}

function NavLink({ item, pathname }: { item: MenuItem; pathname: string }) {
  const active =
    pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}
