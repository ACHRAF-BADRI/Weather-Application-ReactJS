import { useEffect, useId, useRef } from 'react';

// Styled replacement for window.confirm, built on the native <dialog> element:
// modal, closes with Escape or a click on the backdrop, keeps keyboard focus inside.
export default function ConfirmDialog({ open, icon, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const ref = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClose={onCancel}
      onClick={(event) => event.target === ref.current && onCancel()}
      className="confirm-dialog glass m-auto w-[calc(100%-2rem)] max-w-sm p-0 text-fg"
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/15 text-xl">
              {icon}
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              <p id={messageId} className="mt-1 text-sm leading-relaxed text-muted">
                {message}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" className="btn-ghost py-2.5" onClick={onCancel} autoFocus>
              {cancelLabel}
            </button>
            <button type="button" className="btn-danger py-2.5" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
