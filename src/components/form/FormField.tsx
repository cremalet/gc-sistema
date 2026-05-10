import type { ReactNode } from 'react'

type FormFieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  /** Ex: `md:col-span-2` pra ocupar linha inteira dentro de FormSection. */
  className?: string
  children: ReactNode
}

/**
 * Wrapper label + input (children) + hint/error. Não faz spread de register,
 * o input filho cuida disso — deixa FormField agnóstico de react-hook-form.
 */
export default function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
