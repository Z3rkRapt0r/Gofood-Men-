import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WizardStepper } from './WizardStepper';
import { WizardControls } from './WizardControls';
import { StepSettings } from './steps/StepSettings';
import { StepCategories } from './steps/StepCategories';
import { StepDishes } from './steps/StepDishes';
import { StepPhotos } from './steps/StepPhotos';
import { StepBranding } from './steps/StepBranding';
import { Tenant } from '@/types/menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingWizardProps {
    initialData: any;
    tenantId?: string;
    onUpdate: (data: any, nextStep?: number) => Promise<boolean>;
    onExit: () => void;
    currentStepProp?: number;
}

export function OnboardingWizard({ initialData, tenantId, onUpdate, onExit, currentStepProp = 1 }: OnboardingWizardProps) {
    const [step, setStep] = useState(currentStepProp);
    const [formData, setFormData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [canGoNext, setCanGoNext] = useState(false);

    // Unassigned Photos Warning State
    const [showUnassignedWarning, setShowUnassignedWarning] = useState(false);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [totalPhotosCount, setTotalPhotosCount] = useState(0);
    const [highlightUnassignedErrors, setHighlightUnassignedErrors] = useState(false);

    const TOTAL_STEPS = 5;

    const checkUnassignedPhotos = async (): Promise<boolean> => {
        if (!tenantId) return true;

        setIsSaving(true);
        const supabase = createClient();
        const folderPath = `${tenantId}/dishes`;

        try {
            // 1. Get all photos
            const { data: fileList } = await supabase.storage
                .from('dishes')
                .list(folderPath, { limit: 100 });

            const validFiles = (fileList || []).filter(f => f.name !== '.emptyFolderPlaceholder');
            const total = validFiles.length;

            if (total === 0) return true; // No photos, no problem

            // 2. Get all assigned images
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: dishes } = await (supabase.from('dishes') as any)
                .select('image_url')
                .eq('tenant_id', tenantId)
                .not('image_url', 'is', null);

            const assignedUrls = new Set((dishes || []).map((d: any) => d.image_url));

            // 3. Count unassigned
            let unassigned = 0;
            for (const file of validFiles) {
                const { data } = supabase.storage.from('dishes').getPublicUrl(`${folderPath}/${file.name}`);
                if (!assignedUrls.has(data.publicUrl)) {
                    unassigned++;
                }
            }

            if (unassigned > 0) {
                setTotalPhotosCount(total);
                setUnassignedCount(unassigned);
                setShowUnassignedWarning(true);
                setHighlightUnassignedErrors(true);
                return false; // Block navigation
            }

            return true; // OK to proceed

        } catch (error) {
            console.error("Check photos error:", error);
            return true; // Fail safe
        } finally {
            setIsSaving(false);
        }
    };

    const handleProceedWithCleanup = async () => {
        setShowUnassignedWarning(false);
        setIsSaving(true);

        try {
            // Cleanup logic is repeated effectively here or we rely on the generic cleaning by re-fetching
            // But since we are proceeding, we can assume the user wants to delete them.
            // However, to keep it simple and robust, we will just proceed. 
            // Wait, requirement: "la foto non assegnata deve essere cancellata dal bucket"
            // So we MUST delete them here.

            const supabase = createClient();
            const folderPath = `${tenantId}/dishes`;

            // Re-fetch to be safe
            const { data: fileList } = await supabase.storage.from('dishes').list(folderPath, { limit: 100 });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: dishes } = await (supabase.from('dishes') as any)
                .select('image_url')
                .eq('tenant_id', tenantId)
                .not('image_url', 'is', null);

            const assignedUrls = new Set((dishes || []).map((d: any) => d.image_url));

            const filesToDelete: string[] = [];
            (fileList || []).forEach(f => {
                if (f.name === '.emptyFolderPlaceholder') return;
                const { data } = supabase.storage.from('dishes').getPublicUrl(`${folderPath}/${f.name}`);
                if (!assignedUrls.has(data.publicUrl)) {
                    filesToDelete.push(`${folderPath}/${f.name}`);
                }
            });

            if (filesToDelete.length > 0) {
                await supabase.storage.from('dishes').remove(filesToDelete);
                toast.success(`${filesToDelete.length} foto non assegnate cancellate.`);
            }

            // Proceed Next
            await performNextStep();

        } catch (error) {
            console.error("Cleanup error:", error);
            toast.error("Errore durante la pulizia ma proseguro.");
            await performNextStep();
        }
    };

    const performNextStep = async () => {
        setIsSaving(true);
        try {
            const success = await onUpdate(formData, step + 1);
            if (success && step < TOTAL_STEPS) {
                setStep(s => s + 1);
                setCanGoNext(false);
                setHighlightUnassignedErrors(false); // Reset warning highlight
            }
        } catch (error) {
            console.error("Wizard error:", error);
        } finally {
            setIsSaving(false);
        }
    }

    const handleNext = async () => {
        if (step === 4 && !showUnassignedWarning) {
            const isClean = await checkUnassignedPhotos();
            if (!isClean) return; // Dialog will show
        }

        await performNextStep();
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
            setCanGoNext(true);
        } else {
            onExit();
        }
    };

    const updateFormData = (updates: any) => {
        setFormData((prev: any) => ({ ...prev, ...updates }));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <StepSettings
                    data={formData}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 2:
                return <StepCategories
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 3:
                return <StepDishes
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 4:
                return <StepPhotos
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                    highlightUnassigned={highlightUnassignedErrors}
                />;
            case 5:
                return <StepBranding
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
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
            <main className="flex-1 container mx-auto max-w-5xl p-4 md:py-8 pb-32">
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
                canGoNext={canGoNext}
                isSaving={isSaving}

            />

            {/* Unassigned Warning Dialog */}
            <AlertDialog open={showUnassignedWarning} onOpenChange={setShowUnassignedWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Foto non assegnate rilevate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hai caricato <strong>{totalPhotosCount}</strong> foto, ma <strong>{unassignedCount}</strong> non sono state assegnate a nessun piatto.
                            <br /><br />
                            Le foto non assegnate sono state evidenziate in rosso.
                            <br />
                            Se prosegui, <strong>le foto non assegnate verranno cancellate definitivamente</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowUnassignedWarning(false)}>Controlla e Assegna</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleProceedWithCleanup();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Prosegui e Cancella
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
