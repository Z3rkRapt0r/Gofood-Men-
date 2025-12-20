'use client';

import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';

interface StepBrandingProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
}

export function StepBranding({ data, tenantId, onUpdate }: StepBrandingProps) {
    return (
        <div className="h-[calc(100vh-200px)] min-h-[600px] w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <ThemeProvider initialTheme={data.theme_options || {}}>
                <BrandingDesignLab
                    formData={data}
                    tenantId={tenantId}
                    onUpdate={onUpdate}
                    onNext={() => { }} // Controlled by Wizard
                    onBack={() => { }} // Controlled by Wizard
                    hideNavigation={true}
                />
            </ThemeProvider>
        </div>
    );
}
