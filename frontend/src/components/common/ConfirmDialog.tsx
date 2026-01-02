/**
 * ConfirmDialog component.
 * 
 * Reusable modal for confirming destructive actions.
 */

import './ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay">
            <div className="confirm-content">
                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button
                        className="btn-secondary"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`btn-primary ${isDestructive ? 'btn-danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
