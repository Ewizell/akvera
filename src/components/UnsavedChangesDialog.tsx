'use client'

export default function UnsavedChangesDialog({
  open,
  onStay,
  onDiscard,
}: {
  open: boolean
  onStay: () => void
  onDiscard: () => void
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#18212b]/50 p-4"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/[0.08]">
        <h3 className="text-sm font-semibold text-[#28313d]">
          Закрыть без сохранения?
        </h3>

        <p className="mt-1.5 text-xs leading-5 text-[#687382]">
          Вы не сохранили данные. Внесённые изменения будут потеряны.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onStay}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-[#f4f5f7] px-4 text-sm font-semibold text-[#4f5a67] transition hover:bg-[#e9ecef]"
          >
            Продолжить редактирование
          </button>

          <button
            type="button"
            onClick={onDiscard}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-[#28394c] px-4 text-sm font-semibold text-white transition hover:bg-[#1e2a38]"
          >
            Закрыть без сохранения
          </button>
        </div>
      </div>
    </div>
  )
}