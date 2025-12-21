import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimateIconProps {
    icon: LucideIcon;
    className?: string;
    animateOnHover?: boolean;
}

export const AnimateIcon = ({ icon: Icon, className, animateOnHover = true }: AnimateIconProps) => {
    return (
        <div className={cn("relative flex items-center justify-center", animateOnHover && "group/icon")}>
            <Icon
                className={cn(
                    "transition-transform duration-300 ease-in-out",
                    animateOnHover && "group-hover/icon:scale-110 group-hover/icon:rotate-6",
                    className
                )}
            />
        </div>
    );
};
