import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { fetchPhotos, useDeletePhotos } from '@/hooks/usePhotos';
import { WizardStepper } from './WizardStepper';
import { WizardControls } from './WizardControls';
import { StepSettings } from './steps/StepSettings';
import { StepCategories } from './steps/StepCategories';
import { StepDishes } from './steps/StepDishes';
import { StepCharacteristics } from './steps/StepCharacteristics';
import { StepPhotos } from './steps/StepPhotos';
import { StepBranding } from './steps/StepBranding';
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

interface OnboardingWizardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any;
    tenantId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const [showCleanupDialog, setShowCleanupDialog] = useState(false);
    const [unassignedPhotos, setUnassignedPhotos] = useState<string[]>([]);
    const [highlightUnassignedErrors, setHighlightUnassignedErrors] = useState(false);

    const TOTAL_STEPS = 6;

    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter(); // Use if needed for navigation
    const { mutateAsync: deletePhotos } = useDeletePhotos();

    const checkUnassignedPhotos = async (): Promise<boolean> => {
        if (!tenantId) return true; // No tenantId, skip check

        setIsSaving(true);
        try {
            // 1. Get all photos using shared fetcher
            // We use ensureQueryData to get fresh data or cache. 
            // Ideally we want fresh data for validation -> fetchQuery.
            // But ensureQueryData is fine if we invalidated elsewhere properly.
            // Let's use fetchQuery to be sure we see what's on server.
            const fileList = await queryClient.fetchQuery({
                queryKey: ['photos', tenantId],
                queryFn: () => fetchPhotos(tenantId),
                staleTime: 0 // Force fetch
            });

            if (!fileList || fileList.length === 0) {
                return true;
            }

            // 2. Get all assigned images
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: dishes } = await (supabase.from('dishes') as any)
                .select('image_url')
                .eq('tenant_id', tenantId)
                .not('image_url', 'is', null);

            // Normalize URLs to filename for comparison
            // Assigned URLs are full public URLs.
            // File list items have .name and .url (public url).
            const assignedUrls = new Set((dishes || []).map((d: any) => d.image_url));

            const unassignedNames: string[] = [];

            // Check based on Public URL match
            fileList.forEach(f => {
                if (f.name === '.emptyFolderPlaceholder') return;
                if (!assignedUrls.has(f.url)) {
                    unassignedNames.push(f.name);
                }
            });

            if (unassignedNames.length > 0) {
                setUnassignedPhotos(unassignedNames);
                setShowCleanupDialog(true);
                setHighlightUnassignedErrors(true);
                return false; // Block navigation
            }

            return true; // OK to proceed

        } catch (error) {
            console.error("Check photos error:", error);
            // On error, we might default to letting them proceed or showing error
            toast.error("Errore durante il controllo delle foto.");
            return true; // Weak fail-safe: let them pass if check fails
        } finally {
            setIsSaving(false);
        }
    };

    const performNextStep = async () => {
        setIsSaving(true);
        try {
            const success = await onUpdate(formData, step + 1);
            if (success && step < TOTAL_STEPS) {
                setStep(s => s + 1);
                setCanGoNext(false);
                setHighlightUnassignedErrors(false);
            }
        } catch (error) {
            console.error("Wizard error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProceedWithCleanup = async () => {
        if (!tenantId || unassignedPhotos.length === 0) {
            setShowCleanupDialog(false);
            await performNextStep();
            return;
        }

        setIsSaving(true);
        try {
            await deletePhotos({ tenantId, photoNames: unassignedPhotos });
            // Success toast is handled by hook
            setShowCleanupDialog(false);
            await performNextStep();
        } catch (error) {
            console.error("Cleanup error:", error);
            // Even if cleanup fails, we likely want to proceed or warn?
            // Hook shows toast. We'll close dialog and try to proceed.
            setShowCleanupDialog(false);
            await performNextStep();
        } finally {
            setIsSaving(false);
        }
    };

    const handleNext = async () => {
        // Validation for step 5 (Photos) - previously 4
        if (step === 5) {
            const isClean = await checkUnassignedPhotos();
            if (!isClean) return; // Dialog will show
        }

        await performNextStep();
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
            setCanGoNext(true); // Usually backing up implies we can go next again
        } else {
            onExit();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFormData = (updates: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                return <StepCharacteristics
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                />;
            case 5:
                return <StepPhotos
                    data={formData}
                    tenantId={tenantId}
                    onUpdate={updateFormData}
                    onValidationChange={setCanGoNext}
                    highlightUnassigned={highlightUnassignedErrors}
                />;
            case 6:
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
            <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Foto non assegnate rilevate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ci sono <strong>{unassignedPhotos.length}</strong> foto caricate che non sono assegnate a nessun piatto.
                            <br /><br />
                            Le foto non assegnate sono state evidenziate in rosso.
                            <br />
                            Se prosegui, <strong>le foto non assegnate verranno cancellate definitivamente</strong> per mantenere il menu ordinato.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowCleanupDialog(false)}>Controlla e Assegna</AlertDialogCancel>
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
