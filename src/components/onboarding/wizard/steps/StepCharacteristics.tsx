import { useEffect } from 'react';
import { CharacteristicsManager } from '@/components/dashboard/CharacteristicsManager';

interface StepCharacteristicsProps {
    data: any;
    tenantId?: string;
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

export function StepCharacteristics({ tenantId, onValidationChange }: StepCharacteristicsProps) {

    useEffect(() => {
        onValidationChange(true);
    }, [onValidationChange]);

    return (
        <CharacteristicsManager tenantId={tenantId} />
    );
}
