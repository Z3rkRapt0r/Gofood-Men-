'use client';

import { useState } from 'react';
import { WizardStepper } from './WizardStepper';
import { WizardControls } from './WizardControls';
import { StepSettings } from './steps/StepSettings';
import { StepCategories } from './steps/StepCategories';
import { StepDishes } from './steps/StepDishes';
import { StepBranding } from './steps/StepBranding';
import { Tenant } from '@/types/menu';

interface OnboardingWizardProps {
    initialData: any; // We'll refine this type
    tenantId?: string;
    onUpdate: (data: any, nextStep?: number) => Promise<boolean>;
    onExit: () => void;
    currentStepProp?: number;
}

export function OnboardingWizard({ initialData, tenantId, onUpdate, onExit, currentStepProp = 1 }: OnboardingWizardProps) {
    const [step, setStep] = useState(currentStepProp);
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const TOTAL_STEPS = 4;

    const handleNext = async () => {
        setIsSaving(true);
        try {
            // Save data for current step
            const success = await onUpdate(formData, step + 1);
            if (success && step < TOTAL_STEPS) {
                setStep(s => s + 1);
            }
        } catch (error) {
            console.error("Wizard error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            onExit();
        }
    };

    const updateFormData = (updates: any) => {
        setFormData((prev: any) => ({ ...prev, ...updates }));
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <StepSettings data={formData} onUpdate={updateFormData} />;
            case 2: return <StepCategories data={formData} tenantId={tenantId} onUpdate={updateFormData} />;
            case 3: return <StepDishes data={formData} tenantId={tenantId} onUpdate={updateFormData} />;
            case 4: return <StepBranding data={formData} tenantId={tenantId} onUpdate={updateFormData} />;
            default: return <div>Step sconosciuto</div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">

            {/* Header / Stepper Area */}
            <div className="bg-white border-b border-gray-200 pt-6 pb-4 px-4 sticky top-0 z-40 bg-white/90 backdrop-blur-md">
                <div className="container mx-auto max-w-5xl">
                    <WizardStepper currentStep={step} totalSteps={TOTAL_STEPS} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto max-w-5xl p-4 md:py-8 pb-24 md:pb-8">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderStep()}
                </div>
            </main>

            {/* Controls */}
            <WizardControls
                currentStep={step}
                totalSteps={TOTAL_STEPS}
                onBack={handleBack}
                onNext={handleNext}
                isSaving={isSaving}
                onSaveDraft={() => onUpdate(formData)} // Just save without moving next
            />
        </div>
    );
}
