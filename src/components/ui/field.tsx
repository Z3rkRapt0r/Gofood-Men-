import * as React from "react"
import { FieldApi } from "@tanstack/react-form"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function Field({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-2", className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    return <Label className={cn(className)} {...props} />
}

function FieldDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-[0.8rem] text-muted-foreground", className)}
            {...props}
        />
    )
}

// Helper to safely extract error messages from any format (string, object, array)
function getErrorMessage(error: any): string {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (Array.isArray(error)) return error.map(getErrorMessage).join(", ");
    if (typeof error === "object" && error.message) return String(error.message);
    return JSON.stringify(error); // Fallback for unknown objects
}

function FieldError({
    className,
    errors,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
    errors: any[]
}) {
    if (!errors?.length) return null

    return (
        <p
            className={cn("text-[0.8rem] font-medium text-destructive", className)}
            {...props}
        >
            {errors.map(getErrorMessage).join(", ")}
        </p>
    )
}

function FieldGroup({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("space-y-2", className)} {...props} />
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup }
