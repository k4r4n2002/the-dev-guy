/**
 * components/Toast.jsx — Toast Notification Display
 * Renders the toast queue from useToast hook.
 */

export default function Toast({ toasts, onDismiss }) {
    if (!toasts.length) return null;

    return (
        <div className="toast-container" role="alert" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => onDismiss(toast.id)}
                    style={{ cursor: 'pointer' }}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
