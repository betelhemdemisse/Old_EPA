import React, { useEffect } from 'react'

/**
 * Confirmation modal
 * Props:
 * - open: boolean
 * - title: string
 * - message: string
 * - onConfirm: () => void
 * - onCancel: () => void
 * - confirmLabel: string
 * - cancelLabel: string
 */
const Confirmation = ({
  open = false,
  title = 'Are you sure?',
  message = '',
  onConfirm = () => {},
  onCancel = () => {},
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-50 max-w-lg w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
          <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-md bg-white border text-sm text-gray-700 hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Confirmation
