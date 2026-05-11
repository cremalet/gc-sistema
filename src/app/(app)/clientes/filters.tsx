'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ClientesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlBusca = searchParams.get('busca') ?? ''
  const [busca, setBusca] = useState(urlBusca)

  useEffect(() => {
    setBusca(urlBusca)
  }, [urlBusca])

  // Debounce 300ms
  useEffect(() => {
    if (busca === urlBusca) return
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (busca) params.set('busca', busca)
      else params.delete('busca')
      params.delete('page')
      router.push(`/clientes?${params.toString()}`)
    }, 300)
    return () => clearTimeout(handle)
  }, [busca, urlBusca, router, searchParams])

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder="Buscar por nome, CNPJ/CPF, contato ou email"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  )
}
