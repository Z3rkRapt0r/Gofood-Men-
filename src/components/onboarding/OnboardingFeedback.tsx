import { useState } from 'react';
import { Bug, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog";
import SupportForm from "@/components/dashboard/SupportForm";

interface OnboardingFeedbackProps {
    userEmail: string;
    restaurantName: string;
    variant?: 'fab' | 'header';
}

export function OnboardingFeedback({ userEmail, restaurantName, variant = 'fab' }: OnboardingFeedbackProps) {
    const [open, setOpen] = useState(false);

    const triggerButton = variant === 'fab' ? (
        <Button
            variant="outline"
            size="lg"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl border-orange-200 bg-white hover:bg-orange-50 hover:border-orange-300 p-0 transition-transform hover:scale-105"
            title="Segnala un problema o invia feedback"
        >
            <Bug className="w-6 h-6 text-orange-600" />
            <span className="sr-only">Segnala un problema</span>
        </Button>
    ) : (
        <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full"
            title="Segnala un problema"
        >
            <Bug className="w-5 h-5" />
            <span className="sr-only">Segnala un problema</span>
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-orange-100">
                <DialogTitle className="sr-only">Modulo di Assistenza e Segnalazione Bug</DialogTitle>
                <div className="max-h-[85vh] overflow-y-auto">
                    {/* Reuse existing SupportForm but wrap nicely */}
                    <div className="relative">
                        {/* Close visual override if needed, but DialogContent usually handles it. 
                             SupportForm has its own padding/styling so we just render it. */}
                        <SupportForm
                            userEmail={userEmail}
                            restaurantName={restaurantName}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
