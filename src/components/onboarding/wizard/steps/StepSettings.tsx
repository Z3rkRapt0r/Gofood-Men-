import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, Share2, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StepSettingsProps {
    data: any;
    onUpdate: (updates: any) => void;
}

export function StepSettings({ data, onUpdate }: StepSettingsProps) {

    const footerData = data.footer_data || { locations: [], socials: [], show_brand_column: true };

    const updateFooterData = (updates: any) => {
        onUpdate({ footer_data: { ...footerData, ...updates } });
    };

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
                            <div className="space-y-2">
                                <Label htmlFor="restaurantName" className="font-bold">Nome Ristorante *</Label>
                                <Input
                                    id="restaurantName"
                                    value={data.restaurant_name || ''}
                                    onChange={(e) => onUpdate({ restaurant_name: e.target.value })}
                                    placeholder="Es. Trattoria da Mario"
                                    className="py-6"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Il nome ufficiale della tua attività.
                                </p>
                            </div>
                        </div>



                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail" className="font-bold">Email Pubblica</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={data.contact_email || ''}
                                    onChange={(e) => onUpdate({ contact_email: e.target.value })}
                                    placeholder="info@ristorante.it"
                                    className="py-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="coverCharge" className="font-bold">Costo Coperto (€)</Label>
                                <Input
                                    id="coverCharge"
                                    type="number"
                                    step="0.10"
                                    min="0"
                                    value={data.cover_charge || ''}
                                    onChange={(e) => onUpdate({ cover_charge: parseFloat(e.target.value) })}
                                    placeholder="2.50"
                                    className="py-6 font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand-desc" className="font-bold">Descrizione Brand</Label>
                            <Textarea
                                id="brand-desc"
                                value={footerData.brand_description?.it || ''}
                                onChange={(e) => updateFooterData({
                                    brand_description: {
                                        ...footerData.brand_description,
                                        it: e.target.value,
                                        en: e.target.value
                                    }
                                })}
                                placeholder="Racconta brevemente la storia del tuo ristorante..."
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-gray-500">Apparirà nel footer del menu.</p>
                        </div>
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
                        {/* List Locations */}
                        {(footerData.locations || []).map((loc: any, index: number) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newLocs = footerData.locations.filter((_: any, i: number) => i !== index);
                                        updateFooterData({ locations: newLocs });
                                    }}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="space-y-2">
                                    <Label>Città</Label>
                                    <Input
                                        value={loc.city}
                                        onChange={(e) => {
                                            const newLocs = [...footerData.locations];
                                            newLocs[index].city = e.target.value;
                                            updateFooterData({ locations: newLocs });
                                        }}
                                        placeholder="Roma"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Indirizzo</Label>
                                    <Input
                                        value={loc.address}
                                        onChange={(e) => {
                                            const newLocs = [...footerData.locations];
                                            newLocs[index].address = e.target.value;
                                            updateFooterData({ locations: newLocs });
                                        }}
                                        placeholder="Via del Corso, 123"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefono</Label>
                                    <Input
                                        value={loc.phone || ''}
                                        onChange={(e) => {
                                            const newLocs = [...footerData.locations];
                                            newLocs[index].phone = e.target.value;
                                            updateFooterData({ locations: newLocs });
                                        }}
                                        placeholder="+39 06 12345678"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Orari</Label>
                                    <Input
                                        value={loc.opening_hours || ''}
                                        onChange={(e) => {
                                            const newLocs = [...footerData.locations];
                                            newLocs[index].opening_hours = e.target.value;
                                            updateFooterData({ locations: newLocs });
                                        }}
                                        placeholder="Lun-Dom: 12-23"
                                    />
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const newLocs = [...(footerData.locations || []), { city: '', address: '', phone: '', opening_hours: '' }];
                                updateFooterData({ locations: newLocs });
                            }}
                            className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-orange-600 hover:border-orange-300"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Aggiungi un'altra sede
                        </Button>
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
                        {/* List Socials */}
                        {(footerData.socials || []).map((social: any, index: number) => (
                            <div key={index} className="flex gap-3 items-end">
                                <div className="w-1/3 space-y-2">
                                    <Label className="text-xs">Piattaforma</Label>
                                    <Select
                                        value={social.platform}
                                        onValueChange={(value) => {
                                            const newSocials = [...footerData.socials];
                                            newSocials[index].platform = value;
                                            updateFooterData({ socials: newSocials });
                                        }}
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
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs">Link completo (URL)</Label>
                                    <Input
                                        value={social.url}
                                        onChange={(e) => {
                                            const newSocials = [...footerData.socials];
                                            newSocials[index].url = e.target.value;
                                            updateFooterData({ socials: newSocials });
                                        }}
                                        placeholder="https://..."
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        const newSocials = footerData.socials.filter((_: any, i: number) => i !== index);
                                        updateFooterData({ socials: newSocials });
                                    }}
                                    className="mb-[2px] text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                const newSocials = [...(footerData.socials || []), { platform: 'instagram', url: '' }];
                                updateFooterData({ socials: newSocials });
                            }}
                            className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-purple-600 hover:border-purple-300"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Aggiungi Social link
                        </Button>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}
