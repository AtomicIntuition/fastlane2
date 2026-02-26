'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DialogProps {
  /** Controlled open state */
  open: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Dialog title (rendered in header) */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Dialog body content */
  children?: ReactNode;
  /** Optional footer (e.g. action buttons) */
  footer?: ReactNode;
  /** Extra class names for the dialog panel */
  className?: string;
  /** When false, clicking the backdrop will not close the dialog */
  closeOnBackdropClick?: boolean;
  /** When false, pressing Escape will not close the dialog */
  closeOnEscape?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      children,
      footer,
      className,
      closeOnBackdropClick = true,
      closeOnEscape = true,
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLDialogElement);

    /* ---- Sync open prop with <dialog> showModal/close ---- */
    useEffect(() => {
      const dialog = innerRef.current;
      if (!dialog) return;

      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open]);

    /* ---- Handle native cancel (Escape key) ---- */
    const handleCancel = useCallback(
      (e: React.SyntheticEvent<HTMLDialogElement>) => {
        e.preventDefault();
        if (closeOnEscape) onClose();
      },
      [closeOnEscape, onClose],
    );

    /* ---- Backdrop click (click on <dialog> itself, outside panel) ---- */
    const handleBackdropClick = useCallback(
      (e: React.MouseEvent<HTMLDialogElement>) => {
        if (!closeOnBackdropClick) return;
        // Only close if the click target is the <dialog> backdrop (not a child)
        if (e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnBackdropClick, onClose],
    );

    return (
      <dialog
        ref={innerRef}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        className={cn(
          // Reset & backdrop
          'fixed inset-0 z-[var(--fl-z-modal)] m-0 max-h-full max-w-full',
          'h-full w-full bg-transparent p-0',
          'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
          // Open/close animation
          'opacity-0 transition-[opacity,transform,display,overlay] duration-[var(--fl-transition-slow)]',
          'open:opacity-100',
          // Allow starting-style for entry animation (if supported)
          '[&:not([open])]:pointer-events-none',
        )}
      >
        {/* Centering wrapper */}
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Panel */}
          <div
            className={cn(
              'relative w-full max-w-lg',
              'rounded-[var(--fl-radius-xl)] bg-[var(--fl-bg)] shadow-[var(--fl-shadow-xl)]',
              'border border-[var(--fl-border)]',
              // Entry animation via scale
              'scale-95 transition-transform duration-[var(--fl-transition-slow)]',
              open && 'scale-100',
              className,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={cn(
                'absolute right-3 top-3 inline-flex items-center justify-center',
                'h-8 w-8 rounded-[var(--fl-radius-sm)]',
                'text-[var(--fl-text-tertiary)] hover:text-[var(--fl-text)] hover:bg-[var(--fl-bg-secondary)]',
                'transition-colors duration-[var(--fl-transition-fast)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fl-primary)]',
              )}
            >
              <X size={18} />
            </button>

            {/* Header */}
            {(title || description) && (
              <div className="px-6 pt-6 pb-0">
                {title && (
                  <h2 className="text-[var(--fl-text-lg)] font-semibold text-[var(--fl-text)] pr-8">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-[var(--fl-text-sm)] text-[var(--fl-text-secondary)]">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-[var(--fl-border)] px-6 py-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      </dialog>
    );
  },
);

Dialog.displayName = 'Dialog';
