import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const DURATION = 4000; // auto-dismiss delay (ms)
const SWIPE_DISMISS = 40; // px dragged upward before a release dismisses
const EXIT_MS = 200;

const STYLES = {
  success: { icon: '✓', badge: 'bg-emerald-500/15 text-success', bar: 'bg-emerald-400' },
  info: { icon: 'i', badge: 'bg-sky-500/15 text-accent', bar: 'bg-sky-400' },
  error: { icon: '!', badge: 'bg-rose-500/15 text-danger', bar: 'bg-rose-400' },
};

function Toast({ toast, onRemove }) {
  const { t } = useI18n();
  const [offset, setOffset] = useState(0); // current upward drag (negative px)
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  const timer = useRef(null);
  const remaining = useRef(DURATION);
  const startedAt = useRef(0);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), EXIT_MS);
  }, [onRemove, toast.id]);

  // Countdown that pauses while hovered, focused or dragged.
  useEffect(() => {
    if (paused || leaving) return undefined;
    startedAt.current = Date.now();
    timer.current = setTimeout(dismiss, remaining.current);
    return () => {
      clearTimeout(timer.current);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, leaving, dismiss]);

  function onPointerDown(event) {
    if (event.target.closest('button')) return;
    drag.current = { startY: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    setPaused(true);
  }

  function onPointerMove(event) {
    if (!drag.current) return;
    const dy = event.clientY - drag.current.startY;
    // Follow the finger upward; resist downward pulls.
    setOffset(dy < 0 ? dy : dy / 6);
  }

  function onPointerEnd() {
    if (!drag.current) return;
    drag.current = null;
    setPaused(false);
    if (offset <= -SWIPE_DISMISS) dismiss();
    else setOffset(0);
  }

  const style = STYLES[toast.type];
  const dragging = drag.current !== null;

  return (
    <li
      role={toast.type === 'error' ? 'alert' : 'status'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => !drag.current && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        transform: leaving ? 'translateY(-120%)' : `translateY(${offset}px)`,
        opacity: leaving ? 0 : Math.max(0.2, 1 + offset / 120),
        transition: dragging ? 'none' : `transform ${EXIT_MS}ms ease, opacity ${EXIT_MS}ms ease`,
      }}
      className="toast glass pointer-events-auto relative flex cursor-grab touch-none select-none items-center gap-3 overflow-hidden py-3 pl-3 pr-2 active:cursor-grabbing"
    >
      <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${style.badge}`}>
        {style.icon}
      </span>
      <p className="flex-1 text-sm font-medium text-fg">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('toast.close')}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-subtle transition hover:bg-tint/10 hover:text-fg"
      >
        ✕
      </button>
      <span
        aria-hidden
        className={`toast-progress absolute bottom-0 left-0 h-0.5 w-full origin-left ${style.bar}`}
        style={{ animationDuration: `${DURATION}ms`, animationPlayState: paused ? 'paused' : 'running' }}
      />
    </li>
  );
}

export default function Toaster({ toasts, onRemove }) {
  const { t } = useI18n();
  return (
    <section aria-label={t('toast.region')} className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-[1100] flex justify-center px-4">
      <ol aria-live="polite" className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </ol>
    </section>
  );
}
