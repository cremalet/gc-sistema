import { Construction } from 'lucide-react'

type EmConstrucaoProps = {
  pagina: string
}

export default function EmConstrucao({ pagina }: EmConstrucaoProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <Construction size={48} className="text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-1">{pagina}</h2>
      <p className="text-gray-500">Em construção</p>
    </div>
  )
}
