import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, Share2, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useEffect } from 'react';
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";

const locationSchema = z.object({
    city: z.string().min(1, "Inserisci una città"),
    address: z.string().optional(),
    phone: z.string().optional(),
    opening_hours: z.string().optional(),
});

const socialSchema = z.object({
    platform: z.string(),
    url: z.string().url("Inserisci un URL valido"),
});

const formSchema = z.object({
    restaurant_name: z.string().min(1, "Il nome del ristorante è obbligatorio"),
    contact_email: z.string().email("Inserisci un'email valida"),
    // Default is 0, so it's a number. Validation warns if < 0.
    cover_charge: z.number().min(0),
    footer_data: z.object({
        brand_description: z.object({
            it: z.string().min(1, "La descrizione è obbligatoria"),
            en: z.string(),
        }),
        locations: z.array(locationSchema),
        socials: z.array(socialSchema),
        show_brand_column: z.boolean(),
    }),
});

interface StepSettingsProps {
    data: any;
    onUpdate: (updates: any) => void;
    onValidationChange: (isValid: boolean) => void;
}

export function StepSettings({ data, onUpdate, onValidationChange }: StepSettingsProps) {

    const form = useForm({
        defaultValues: {
            restaurant_name: data.restaurant_name || '',
            contact_email: data.contact_email || '',
            cover_charge: data.cover_charge || 0,
            footer_data: {
                brand_description: {
                    it: data.footer_data?.brand_description?.it || '',
                    en: data.footer_data?.brand_description?.en || '',
                },
                locations: data.footer_data?.locations || [],
                socials: data.footer_data?.socials || [],
                show_brand_column: data.footer_data?.show_brand_column ?? true,
            },
        },
        validators: {
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            // Handle submit if needed, though we sync on change
            console.log(value);
        },
    });

    useEffect(() => {
        const subscription = form.store.subscribe(() => {
            const state = form.state;
            onUpdate(state.values);
        });
        return () => subscription();
    }, [form, onUpdate]);

    // Sync validation state
    useEffect(() => {
        const subscription = form.store.subscribe(() => {
            const state = form.state;
            onValidationChange(state.isFormValid);
        });
        return () => subscription();
    }, [form, onValidationChange]);


    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-gray-900">Chi siamo? 🏠</h2>
                <p className="text-gray-600 mt-1">
                    Raccontaci del tuo ristorante. Queste informazioni appariranno nel tuo menu digitale.
                </p>
            </div>

            <Accordion type="single" collapsible defaultValue="info" className="w-full space-y-4">

                {/* 1. Basic Info */}
                <AccordionItem value="info" className="border-none rounded-xl bg-white shadow-sm border border-gray-100 px-4">
                    <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Info className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900">Informazioni Base</h3>
                                <p className="text-sm text-gray-500 font-normal">Nome, slogan e contatti</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <form.Field
                                name="restaurant_name"
                                children={(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name} className="font-bold">Nome Ristorante *</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="Es. Trattoria da Mario"
                                            className="py-6"
                                        />
                                        <FieldDescription>
                                            Il nome ufficiale della tua attività.
                                        </FieldDescription>
                                        <FieldError errors={field.state.meta.errors} />
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <form.Field
                                name="contact_email"
                                children={(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name} className="font-bold">Email Pubblica *</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="info@ristorante.it"
                                            className="py-6"
                                        />
                                        <FieldError errors={field.state.meta.errors} />
                                    </Field>
                                )}
                            />
                            <form.Field
                                name="cover_charge"
                                children={(field) => (
                                    <Field>
                                        <FieldLabel htmlFor={field.name} className="font-bold">Costo Coperto (€)</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            type="number"
                                            step="0.10"
                                            min="0"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                                            placeholder="2.50"
                                            className="py-6 font-mono"
                                        />
                                    </Field>
                                )}
                            />
                        </div>

                        <form.Field
                            name="footer_data.brand_description.it"
                            children={(field) => (
                                <Field>
                                    <FieldLabel htmlFor={field.name} className="font-bold">Descrizione Brand *</FieldLabel>
                                    <Textarea
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value);
                                            // Also update english version for now to keep sync behavior
                                            form.setFieldValue('footer_data.brand_description.en', e.target.value);
                                        }}
                                        placeholder="Racconta brevemente la storia del tuo ristorante..."
                                        className="min-h-[100px]"
                                    />
                                    <FieldDescription>Apparirà nel footer del menu.</FieldDescription>
                                    <FieldError errors={field.state.meta.errors} />
                                </Field>
                            )}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Locations */}
                <AccordionItem value="locations" className="border-none rounded-xl bg-white shadow-sm border border-gray-100 px-4">
                    <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900">Sedi e Orari</h3>
                                <p className="text-sm text-gray-500 font-normal">Dove trovarti e quando sei aperto</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        <form.Field
                            name="footer_data.locations"
                            mode="array"
                            children={(field) => (
                                <>
                                    {field.state.value?.map((_: any, index: number) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => field.removeValue(index)}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>

                                            <form.Field
                                                name={`footer_data.locations[${index}].city` as any}
                                                children={(subField) => (
                                                    <div className="space-y-2">
                                                        <Label>Città *</Label>
                                                        <Input
                                                            value={subField.state.value as string}
                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                            placeholder="Roma"
                                                        />
                                                        <FieldError errors={subField.state.meta.errors} />
                                                    </div>
                                                )}
                                            />

                                            <form.Field
                                                name={`footer_data.locations[${index}].address` as any}
                                                children={(subField) => (
                                                    <div className="space-y-2">
                                                        <Label>Indirizzo</Label>
                                                        <Input
                                                            value={subField.state.value as string}
                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                            placeholder="Via del Corso, 123"
                                                        />
                                                    </div>
                                                )}
                                            />
                                            <form.Field
                                                name={`footer_data.locations[${index}].phone` as any}
                                                children={(subField) => (
                                                    <div className="space-y-2">
                                                        <Label>Telefono</Label>
                                                        <Input
                                                            value={subField.state.value as string}
                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                            placeholder="+39 06 12345678"
                                                        />
                                                    </div>
                                                )}
                                            />
                                            <form.Field
                                                name={`footer_data.locations[${index}].opening_hours` as any}
                                                children={(subField) => (
                                                    <div className="space-y-2">
                                                        <Label>Orari</Label>
                                                        <Input
                                                            value={subField.state.value as string}
                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                            placeholder="Lun-Dom: 12-23"
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => field.pushValue({ city: '', address: '', phone: '', opening_hours: '' })}
                                        className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-orange-600 hover:border-orange-300"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Aggiungi un'altra sede
                                    </Button>
                                </>
                            )}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Socials */}
                <AccordionItem value="socials" className="border-none rounded-xl bg-white shadow-sm border border-gray-100 px-4">
                    <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900">Social Network</h3>
                                <p className="text-sm text-gray-500 font-normal">Collega i tuoi profili social</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        <form.Field
                            name="footer_data.socials"
                            mode="array"
                            children={(field) => (
                                <>
                                    {field.state.value?.map((_: any, index: number) => (
                                        <div key={index} className="flex gap-3 items-end">
                                            <div className="w-1/3 space-y-2">
                                                <Label className="text-xs">Piattaforma</Label>
                                                <form.Field
                                                    name={`footer_data.socials[${index}].platform` as any}
                                                    children={(subField) => (
                                                        <Select
                                                            value={subField.state.value as string}
                                                            onValueChange={(value) => subField.handleChange(value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Social" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                                <SelectItem value="tiktok">TikTok</SelectItem>
                                                                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                                                                <SelectItem value="website">Sito Web</SelectItem>
                                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                                <SelectItem value="other">Altro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Link completo (URL)</Label>
                                                <form.Field
                                                    name={`footer_data.socials[${index}].url` as any}
                                                    children={(subField) => (
                                                        <>
                                                            <Input
                                                                value={subField.state.value as string}
                                                                onChange={(e) => subField.handleChange(e.target.value)}
                                                                placeholder="https://..."
                                                            />
                                                            <FieldError errors={subField.state.meta.errors} />
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => field.removeValue(index)}
                                                className="mb-[2px] text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => field.pushValue({ platform: 'instagram', url: '' })}
                                        className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-purple-600 hover:border-purple-300"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Aggiungi Social link
                                    </Button>
                                </>
                            )}
                        />
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}
