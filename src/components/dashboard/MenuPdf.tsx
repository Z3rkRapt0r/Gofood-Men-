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
type Dish = Database['public']['Tables']['dishes']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Allergen = { id: string; name: string; icon: string };
type Tenant = {
    restaurant_name: string;
    logo_url: string | null;
};

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        paddingBottom: 60, // Space for footer
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#fed7aa', // orange-200
        paddingBottom: 15,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ea580c', // orange-600
    },
    categorySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
        fontWeight: 'medium',
    },
    headerLogo: {
        width: 60,
        height: 60,
        objectFit: 'contain',
        borderRadius: 8,
    },
    // Removed old categoryTitle style as it is now in header
    dishRow: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
        minHeight: 50,
    },
    dishContent: {
        flex: 1,
        paddingRight: 10,
    },
    dishHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    dishName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    dishPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ea580c',
    },
    dishDesc: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.4,
    },
    dishImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        objectFit: 'cover',
        marginLeft: 10,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    badge: {
        fontSize: 8,
        color: '#6b7280',
        padding: '2 4',
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
    },
    allergensContainer: {
        marginTop: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    allergenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    allergenIcon: {
        fontSize: 8, // Emoji/Text icon size
    },
    allergenText: {
        fontSize: 8,
        color: '#ef4444',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 9,
        color: '#9ca3af',
    },
    footerLink: {
        fontSize: 9,
        color: '#ea580c',
        textDecoration: 'none',
    },
    footerLogo: {
        width: 24,
        height: 24,
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

    return (
        <Document>
            {/* Create a separate Page (or sequence of pages) for EACH category to allow unique Headers */}
            {categories.map((cat) => {
                const catDishes = getCategoryDishes(cat.id);
                if (catDishes.length === 0) return null;

                return (
                    <Page key={cat.id} size="A4" style={styles.page} wrap>
                        {/* Header - Fixed on Every Page for this Category Section */}
                        <View style={styles.header} fixed>
                            <View style={styles.headerLeft}>
                                <Text style={styles.restaurantName}>{tenant.restaurant_name}</Text>
                                {/* Category Name REPLACES "Menu" */}
                                <Text style={styles.categorySubtitle}>{cat.name as string}</Text>
                            </View>
                            <Image
                                src={logoSrc}
                                style={styles.headerLogo}
                            />
                        </View>

                        {/* List of Dishes for this Category */}
                        <View>
                            {catDishes.map((dish) => {
                                const dishAllergens = getDishesAllergens(dish.allergen_ids);

                                return (
                                    <View key={dish.id} style={styles.dishRow} wrap={false}>
                                        <View style={styles.dishContent}>
                                            <View style={styles.dishHeader}>
                                                <Text style={styles.dishName}>{dish.name as string}</Text>
                                                <Text style={styles.dishPrice}>€{(dish.price || 0).toFixed(2)}</Text>
                                            </View>
                                            <Text style={styles.dishDesc}>
                                                {(dish.description as string) || ''}
                                            </Text>

                                            {/* Badges */}
                                            <View style={styles.badgesContainer}>
                                                {dish.is_homemade && <Text style={styles.badge}>Fatto in casa</Text>}
                                                {dish.is_frozen && <Text style={styles.badge}>Surgelato</Text>}
                                                {dish.is_vegetarian && <Text style={styles.badge}>Vegetariano</Text>}
                                                {dish.is_vegan && <Text style={styles.badge}>Vegano</Text>}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Footer - Fixed on Every Page */}
                        <View style={styles.footer} fixed>
                            <Image src={goFoodLogoUrl} style={styles.footerLogo} />
                            <Text style={styles.footerText}>Powered by </Text>
                            <Link src="https://gofoodmenu.it/" style={styles.footerLink}>
                                Go!Food Menù
                            </Link>
                        </View>
                    </Page>
                );
            })}
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
