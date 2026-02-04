import React, { useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

const ToastMessage = ({ open = false, type = 'success', message = '', duration = 3000, onClose = () => {} }) => {
  useEffect(() => {
    if (!open) return undefined
    const t = setTimeout(() => onClose(), duration)
    return () => clearTimeout(t)
  }, [open, duration, onClose])

  if (!open) return null

  const icon = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  }[type]

  const bg = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
  }[type]

  const border = {
    success: 'ring-1 ring-green-200',
    error: 'ring-1 ring-red-200',
    info: 'ring-1 ring-blue-200',
    warning: 'ring-1 ring-yellow-200',
  }[type]

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 max-w-xs w-full"
    >
      <div className={`flex items-start gap-3 p-3 rounded-lg shadow-md ${bg} ${border} transition-all`}>
        <div className="pt-0.5">{icon}</div>
        <div className="flex-1 text-sm text-gray-800">{message}</div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ToastMessage
