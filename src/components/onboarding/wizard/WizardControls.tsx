import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";

interface WizardControlsProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onSaveDraft?: () => void;
    isSaving?: boolean;
    canGoNext?: boolean;
}

export function WizardControls({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSaveDraft,
    isSaving = false,
    canGoNext = true
}: WizardControlsProps) {

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:sticky md:bottom-0 z-50">
            <div className="container mx-auto flex items-center justify-between gap-4">

                {/* Left: Back Button */}
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isSaving || (isFirstStep && !onSaveDraft)} // Disable back on step 1 unless we repurpose it for "Logout/Exit"
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden md:inline">{isFirstStep ? "Esci" : "Indietro"}</span>
                </Button>



                {/* Right: Next/Finish Button */}
                <Button
                    onClick={onNext}
                    disabled={!canGoNext || isSaving}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Salvataggio...
                        </>
                    ) : isLastStep ? (
                        <>
                            Completa <CheckCircleIcon className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        <>
                            Continua <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
