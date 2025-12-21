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
            {/* Mobile View */}
            <div className="md:hidden flex items-center justify-between py-3 px-5 shadow-sm bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                {/* Logo */}
                <div className="w-8 h-8 relative flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/favicon.svg" alt="Gofood Menu" className="w-full h-full object-contain" />
                </div>

                {/* Steps Indicator */}
                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xs font-bold text-gray-900">
                        {STEPS.find(s => s.id === currentStep)?.label}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                            Step {currentStep} di {totalSteps}
                        </span>
                        <Progress value={progress} className="w-16 h-1.5 bg-gray-100" />
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-between relative px-6 py-2">
                {/* Connecting Lines */}
                <div className="absolute top-[26px] left-0 w-full h-0.5 bg-gray-100 -z-10 rounded-full" />
                <div
                    className="absolute top-[26px] left-0 h-0.5 bg-orange-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-3 relative min-w-[100px] z-10">
                            {/* Icon Circle */}
                            <div className="bg-white px-2 pt-1 pb-1"> {/* Masking background for line */}
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isActive && "border-orange-500 bg-white text-orange-600 shadow-lg shadow-orange-100 ring-4 ring-orange-50 scale-105",
                                        isCompleted && "border-orange-500 bg-orange-500 text-white shadow-sm",
                                        !isActive && !isCompleted && "border-gray-200 bg-white text-gray-300"
                                    )}
                                >
                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    isActive && "text-orange-600 translate-y-0",
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
