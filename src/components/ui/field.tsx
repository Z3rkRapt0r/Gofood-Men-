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
            {errors.map((e: any) => e?.message ? String(e.message) : String(e)).join(", ")}
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
