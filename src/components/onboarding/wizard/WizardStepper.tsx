import { Zap, NotebookPen, UtensilsCrossed, Palette, CheckCircle, Circle, Image, Tag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
    currentStep: number;
    totalSteps: number;
}

const STEPS = [
    { id: 1, label: "Impostazioni", icon: Zap },
    { id: 2, label: "Categorie", icon: NotebookPen },
    { id: 3, label: "Piatti", icon: UtensilsCrossed },
    { id: 4, label: "Caratteristiche", icon: Tag },
    { id: 5, label: "Foto", icon: Image },
    { id: 6, label: "Branding", icon: Palette },
];

export function WizardStepper({ currentStep, totalSteps }: WizardStepperProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full space-y-4">
            {/* Mobile Progress Bar */}
            {/* Mobile Minimal Stepper */}
            {/* Mobile Minimal Stepper with Gofood Logo */}
            {/* Mobile Compact Header */}
            <div className="md:hidden flex items-center justify-between py-2 px-4 shadow-sm bg-white/90 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
                {/* Small Logo */}
                <div className="w-8 h-8 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.svg" alt="Gofood Menu" className="w-full h-full object-contain" />
                </div>

                {/* Steps Indicator */}
                <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1">
                        {STEPS.map((s) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    s.id === currentStep
                                        ? "w-4 h-1 bg-orange-500" // Active
                                        : "w-1 h-1 bg-gray-200"   // Inactive
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                        {STEPS.find(s => s.id === currentStep)?.label}
                    </span>
                </div>
            </div>

            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center justify-between relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full" />

                {/* Active Line */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-orange-500 -z-10 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2 min-w-[100px]">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                    isActive && "border-orange-500 bg-orange-50 text-orange-600 scale-110 shadow-orange-100",
                                    isCompleted && "border-orange-500 bg-orange-500 text-white",
                                    !isActive && !isCompleted && "border-gray-200 bg-white text-gray-400"
                                )}
                            >
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive && "text-orange-600 font-bold",
                                    isCompleted && "text-gray-900",
                                    !isActive && !isCompleted && "text-gray-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
