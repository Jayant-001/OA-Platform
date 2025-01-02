import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative max-h-full overflow-y-auto">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
}

export function DialogOverlay({ children }: { children: ReactNode }) {
    return <div className="p-4">{children}</div>;
}

export function DialogContent({ children }: { children: ReactNode }) {
    return <div className="p-4">{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
    return <div className="border-b p-4">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
    return <h2 className="text-xl font-semibold">{children}</h2>;
}

export function DialogClose({ onClose }: { onClose: () => void }) {
    return (
        <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
        >
            &times;
        </button>
    );
}

export function DialogBody({ children }: { children: ReactNode }) {
    return <div className="p-4">{children}</div>;
}
