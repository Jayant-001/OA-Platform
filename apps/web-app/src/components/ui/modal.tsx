import { ReactNode } from "react";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} className="rounded-lg shadow-lg">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white p-6 rounded-lg">
        <button
          className="absolute top-0 right-0 p-2"
          onClick={onClose}
        >
          <span className="text-xl">&times;</span>
        </button>
        {children}
      </div>
    </Dialog>
  );
}
