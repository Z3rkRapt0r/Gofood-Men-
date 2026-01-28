'use client';

/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Link,
    PDFDownloadLink,
    Font,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Database } from '@/types/database';

// Types
type Dish = Database['public']['Tables']['dishes']['Row'] & {
    allergen_ids?: string[];
};
type Category = Database['public']['Tables']['categories']['Row'];
type Allergen = { id: string; name: any; icon: string };
type Tenant = {
    restaurant_name: string;
    logo_url: string | null;
    cover_charge: number;
};

// Styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 50,
        paddingBottom: 70,
        paddingLeft: 60,
        paddingRight: 60,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 40,
        paddingBottom: 20,
        borderBottomWidth: 1.5,
        borderBottomColor: '#111827',
    },
    restaurantName: {
        fontSize: 32,
        fontFamily: 'Times-Bold',
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    categorySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 4,
        fontFamily: 'Helvetica-Bold',
    },
    headerLogo: {
        width: 50,
        height: 50,
        objectFit: 'contain',
        marginBottom: 15,
    },
    categoryHeader: {
        marginTop: 30,
        marginBottom: 20,
        alignItems: 'center',
    },
    categoryTitle: {
        fontSize: 22,
        fontFamily: 'Times-Bold',
        color: '#111827',
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 5,
        paddingHorizontal: 20, // Added padding for the border look
    },
    dishRow: {
        marginBottom: 20,
    },
    dishHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dishName: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        color: '#111827',
    },
    dishLeader: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        borderStyle: 'dotted',
        marginHorizontal: 8,
        height: 10,
    },
    dishPrice: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    dishDesc: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.5,
        fontFamily: 'Times-Italic', // Ingredients in italic
        maxWidth: '90%',
    },
    allergensContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    allergenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    allergenIcon: {
        fontSize: 8,
    },
    allergenText: {
        fontSize: 8,
        color: '#9ca3af',
        fontFamily: 'Helvetica',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 60,
        right: 60,
        borderTopWidth: 0.5,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 8,
        color: '#9ca3af',
    },
    footerLink: {
        fontSize: 8,
        color: '#9ca3af',
        textDecoration: 'none',
    },
    // Useful Info Section
    infoSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    infoTitle: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        marginBottom: 6,
        color: '#111827',
    },
    infoText: {
        fontSize: 9,
        color: '#4b5563',
        fontFamily: 'Times-Italic',
    },
    // Legend Styles
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
        gap: 10,
    },
    legendItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 5,
        marginBottom: 6,
    },
    legendIcon: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    legendName: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    legendDesc: {
        fontSize: 8,
        color: '#6b7280',
        marginTop: 1,
    },
});

// PDF Document Component
const MenuDocument = ({
    dishes,
    categories,
    allergens,
    tenant,
    goFoodLogoUrl,
}: {
    dishes: Dish[];
    categories: Category[];
    allergens: Allergen[];
    tenant: Tenant;
    goFoodLogoUrl: string;
}) => {
    // Helper to get dishes for a category
    const getCategoryDishes = (catId: string) => {
        return dishes.filter((d) => d.category_id === catId);
    };

    // Helper to get allergen details
    const getDishesAllergens = (dishAllergenIds: string[] | null) => {
        if (!dishAllergenIds || dishAllergenIds.length === 0) return [];
        return dishAllergenIds.map(id => allergens.find(a => a.id === id)).filter(Boolean) as Allergen[];
    };

    // Helper to validate image URL
    const getValidLogoUrl = (url: string | null | undefined, defaultUrl: string) => {
        if (!url) return defaultUrl;
        const lower = url.toLowerCase();
        // Check for supported formats (jpg, jpeg, png)
        // We use includes to handle potential query parameters (though less likely for public buckets)
        if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png')) {
            return url;
        }
        return defaultUrl;
    };

    const logoSrc = getValidLogoUrl(tenant.logo_url, goFoodLogoUrl);

    // Helper to extract string from Json name
    const resolveJson = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
            // Priority: Italian, then English, then first available key
            return val.it || val.en || Object.values(val)[0] || '';
        }
        return String(val);
    };

    return (
        <Document>
            {/* Create a separate Page (or sequence of pages) for EACH category to allow unique Headers */}
            {categories.map((cat) => {
                const catDishes = getCategoryDishes(cat.id);
                if (catDishes.length === 0) return null;

                return (
                    <Page key={cat.id} size="A4" style={styles.page} wrap>
                        {/* Header - Centered for each category section */}
                        <View style={styles.header} fixed>
                            <Image
                                src={logoSrc}
                                style={styles.headerLogo}
                            />
                            <Text style={styles.restaurantName}>{tenant.restaurant_name}</Text>
                        </View>

                        {/* Category Title */}
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryTitle}>{resolveJson(cat.name)}</Text>
                        </View>

                        {/* List of Dishes */}
                        <View>
                            {catDishes.map((dish) => {
                                const dishAllergens = getDishesAllergens(dish.allergen_ids || []);
                                return (
                                    <View key={dish.id} style={styles.dishRow} wrap={false}>
                                        <View style={styles.dishHeader}>
                                            <Text style={styles.dishName}>{resolveJson(dish.name)}</Text>
                                            <View style={styles.dishLeader} />
                                            <Text style={styles.dishPrice}>€{(dish.price || 0).toFixed(2)}</Text>
                                        </View>

                                        <Text style={styles.dishDesc}>
                                            {resolveJson(dish.description)}
                                        </Text>

                                        {/* Allergens list */}
                                        {dishAllergens.length > 0 && (
                                            <View style={styles.allergensContainer}>
                                                {dishAllergens.map((allergen) => (
                                                    <View key={allergen.id} style={styles.allergenItem}>
                                                        {/* Icon removed because emojis cause rendering issues in built-in PDF fonts */}
                                                        <Text style={styles.allergenText}>• {resolveJson(allergen.name)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer} fixed>
                            <Text style={styles.footerText}>Powered by </Text>
                            <Link src="https://gofoodmenu.it/" style={styles.footerLink}>
                                Go!Food Menù
                            </Link>
                        </View>
                    </Page>
                );
            })}

            {/* Final Information & Legend Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Image src={logoSrc} style={styles.headerLogo} />
                    <Text style={styles.restaurantName}>{tenant.restaurant_name}</Text>
                </View>

                {/* Cover Charge */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Informazioni</Text>
                    <Text style={styles.infoText}>
                        Prezzo per il coperto: €{tenant.cover_charge.toFixed(2)}
                    </Text>
                </View>

                {/* Allergen Legend */}
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.infoTitle}>Legenda Allergeni</Text>
                    <Text style={styles.infoText}>
                        Secondo il Regolamento UE 1169/2011, i nostri piatti possono contenere le seguenti sostanze o i prodotti loro derivati:
                    </Text>

                    <View style={styles.legendGrid}>
                        {allergens.map((allergen) => (
                            <View key={allergen.id} style={styles.legendItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.legendName}>
                                        • {resolveJson(allergen.name)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Final legal note */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 7, color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>
                        Per maggiori informazioni sulle intolleranze e allergie alimentari, il nostro personale è a vostra completa disposizione.
                        In mancanza di prodotti freschi, alcune materie prime potrebbero essere surgelate o abbattute all'origine.
                    </Text>
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Powered by </Text>
                    <Link src="https://gofoodmenu.it/" style={styles.footerLink}>
                        Go!Food Menù
                    </Link>
                </View>
            </Page>
        </Document>
    );
};

// Download Button Component
interface DownloadMenuButtonProps {
    dishes: any[];
    categories: any[];
    allergens: any[];
    tenant: {
        restaurant_name: string;
        logo_url: string | null;
        cover_charge: number;
    };
}

export default function DownloadMenuButton({ dishes, categories, allergens, tenant }: DownloadMenuButtonProps) {
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const goFoodLogoUrl = `${window.location.origin}/web-app-manifest-192x192.png`;

    return (
        <PDFDownloadLink
            document={
                <MenuDocument
                    dishes={dishes}
                    categories={categories}
                    allergens={allergens}
                    tenant={tenant}
                    goFoodLogoUrl={goFoodLogoUrl}
                />
            }
            fileName={`menu-${tenant.restaurant_name.toLowerCase().replace(/\s+/g, '-')}.pdf`}
        >
            {/* @ts-ignore */}
            {({ blob, url, loading, error }) => (
                <Button
                    variant="outline"
                    disabled={loading}
                    className="gap-2 border-orange-200 text-orange-700 hover:text-orange-800 hover:bg-orange-50 hover:border-orange-300"
                >
                    <Download className="w-4 h-4" />
                    {loading ? 'Generazione PDF...' : 'Scarica PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}
