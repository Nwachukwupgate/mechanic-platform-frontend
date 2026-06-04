type AdminConfirmModalProps = {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger' | 'success'
  loading?: boolean
  children?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function AdminConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
  children,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  if (!open) return null

  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : confirmVariant === 'success'
        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
        : 'bg-violet-600 hover:bg-violet-700 text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={loading ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="admin-confirm-title"
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6"
      >
        <h3 id="admin-confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
