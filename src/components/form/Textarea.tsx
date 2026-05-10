import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const BASE_CLASS =
  'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-y'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className = '', rows = 3, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        {...props}
        className={`${BASE_CLASS} ${className}`.trim()}
      />
    )
  },
)

export default Textarea
