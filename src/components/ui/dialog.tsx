'use client';

import * as React from 'react';

interface DialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
    const [isOpen, setIsOpen] = React.useState(open || false);

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open);
        }
    }, [open]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange?.(false)}
            />
            {/* Dialog Context provider not needed for simple version if we clone or manage state differently, 
          but usually separate components need context. 
          For simplicity in this fix, we assume standard usage pattern where direct children usage doesn't strictly depend on context 
          unless we implement it deeply. 
          Actually, children need to know they are in a dialog? No, they just render.
          BUT, standard usage is: 
          <Dialog>
             <DialogTrigger />
             <DialogContent />
          </Dialog>
          OR controlled: <Dialog open={open}> ... </DialogContent>.
          My Usage in ActivationModal is:
          <Dialog open={isOpen}> <DialogContent> ... </DialogContent> </Dialog>
      */}
            {children}
        </div>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`relative z-50 grid w-full max-w-lg gap-4 rounded-xl border bg-white p-6 shadow-lg animate-in fade-in-0 zoom-in-95 ${className || ''}`}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}>
            {children}
        </div>
    );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-semibold leading-none tracking-tight">
            {children}
        </h2>
    );
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm text-gray-500">
            {children}
        </p>
    );
}
