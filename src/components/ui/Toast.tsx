'use client';

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ================================================================== */
/*  Toast store (module-level state + listeners pattern)              */
/* ================================================================== */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

type Listener = () => void;

let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

function addToast(item: Omit<ToastItem, 'id'>): string {
  const id = String(++nextId);
  toasts = [...toasts, { ...item, id }];
  emitChange();
  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emitChange();
}

/* ------------------------------------------------------------------ */
/*  Public `toast` helper                                              */
/* ------------------------------------------------------------------ */

export interface ToastOptions {
  description?: string;
  /** Auto-dismiss duration in milliseconds (default 4000, 0 = never) */
  duration?: number;
}

function createToast(type: ToastType, message: string, opts?: ToastOptions): string {
  return addToast({
    type,
    message,
    description: opts?.description,
    duration: opts?.duration ?? 4000,
  });
}

export const toast = {
  success: (message: string, opts?: ToastOptions) => createToast('success', message, opts),
  error: (message: string, opts?: ToastOptions) => createToast('error', message, opts),
  warning: (message: string, opts?: ToastOptions) => createToast('warning', message, opts),
  info: (message: string, opts?: ToastOptions) => createToast('info', message, opts),
  dismiss: (id: string) => removeToast(id),
};

/* ================================================================== */
/*  Visuals                                                           */
/* ================================================================== */

const iconMap: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const typeStyles: Record<ToastType, string> = {
  success: 'border-[var(--fl-success)] text-[var(--fl-success)] [&_.toast-icon]:text-[var(--fl-success)]',
  error: 'border-[var(--fl-danger)] text-[var(--fl-text)] [&_.toast-icon]:text-[var(--fl-danger)]',
  warning: 'border-[var(--fl-warning)] text-[var(--fl-text)] [&_.toast-icon]:text-[var(--fl-warning)]',
  info: 'border-[var(--fl-info)] text-[var(--fl-text)] [&_.toast-icon]:text-[var(--fl-info)]',
};

/* ================================================================== */
/*  Individual Toast component                                        */
/* ================================================================== */

function ToastCard({ item }: { item: ToastItem }) {
  // Auto-dismiss timer
  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;
    const timer = setTimeout(() => removeToast(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration]);

  const handleDismiss = useCallback(() => removeToast(item.id), [item.id]);

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto relative flex w-full max-w-sm items-start gap-3',
        'rounded-[var(--fl-radius-lg)] border-l-4 bg-[var(--fl-bg)] px-4 py-3',
        'shadow-[var(--fl-shadow-lg)]',
        'animate-[toast-enter_0.3s_ease-out]',
        typeStyles[item.type],
      )}
    >
      {/* Icon */}
      <span className="toast-icon mt-0.5 shrink-0">{iconMap[item.type]}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--fl-text-sm)] font-medium text-[var(--fl-text)]">
          {item.message}
        </p>
        {item.description && (
          <p className="mt-0.5 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
            {item.description}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={cn(
          'shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-[var(--fl-radius-sm)]',
          'text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)]',
          'transition-colors duration-[var(--fl-transition-fast)]',
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ================================================================== */
/*  <Toaster /> – render toast list                                   */
/* ================================================================== */

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (items.length === 0) return null;

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        aria-live="polite"
        aria-label="Notifications"
        className={cn(
          'fixed top-4 right-4 z-[var(--fl-z-toast)] flex flex-col gap-2',
          'pointer-events-none w-full max-w-sm',
        )}
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
