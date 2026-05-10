import { forwardRef, type SelectHTMLAttributes } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  options: readonly SelectOption[]
  placeholder?: string
}

const BASE_CLASS =
  'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, className = '', ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      {...props}
      className={`${BASE_CLASS} ${className}`.trim()}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
})

export default Select
