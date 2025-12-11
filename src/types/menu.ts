// ============================================================
// TYPES: Static Menu (JSON)
// ============================================================

export interface Translation {
  it: string;
  en: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  allergens?: string[];
  is_seasonal?: boolean;
}

export interface Category {
  id: string;
  name: string;
  dishes: Dish[];
}

export interface MenuData {
  categories: Category[];
}

export interface Allergen {
  id: string;
  number: number;
  icon: string;
  name: string;
  description?: string;
}

export interface AllergenData {
  allergens: Allergen[];
  legalText: string;
  regulationTitle: string;
  regulationText: string;
  rapidCooling: string;
  note: string;
  contactText: string;
  coverCharge: string;
}

export type Language = 'it' | 'en';

// ============================================================
// TYPES: Database (Supabase Multi-Tenant)
// ============================================================

export type SubscriptionTier = 'free' | 'basic' | 'premium';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'suspended';

/**
 * Profile utente (collegato a Supabase Auth)
 */
export interface Profile {
  id: string; // UUID from auth.users
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tenant (ristorante)
 */

// ============================================================
// TYPES: Footer Configuration
// ============================================================

export interface FooterLocation {
  city: string;
  address: string;
  phone?: string;
  opening_hours?: string;
}

export interface FooterLink {
  label: Translation;
  url: string;
  icon?: string; // Emoji or icon name
}

export interface FooterSocial {
  platform: 'facebook' | 'instagram' | 'tripadvisor' | 'website' | 'other';
  url: string;
  icon?: string; // Emoji
}

export interface FooterData {
  locations: FooterLocation[];
  socials: FooterSocial[];
  show_brand_column: boolean; // Toggle for the first column
  brand_description?: Translation; // Custom description for the brand column
}

export interface TenantDesignSettings {
  tenant_id: string;
  theme_config: Record<string, unknown>; // Typed as ThemeConfig in frontend
  created_at: string;
  updated_at: string;
}

// ============================================================
// TYPES: Locations (Database)
// ============================================================

export interface TenantLocationDB {
  id: string; // UUID
  tenant_id: string;
  address: string;
  city: string;
  phone: string | null;
  opening_hours: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string; // UUID
  owner_id: string; // UUID ref to profiles.id

  // Business info
  restaurant_name: string;
  tagline?: string; // Short description under the name
  slug: string; // URL-friendly: /magna-roma

  // Contact
  contact_email: string | null;

  country: string; // Default: 'IT'

  // Branding
  logo_url: string | null; // Supabase Storage URL
  // Branding
  // Colors and Theme Options moved to tenant_design_settings

  // Footer
  footer_data?: FooterData; // JSONB

  // Locations
  tenant_locations?: TenantLocationDB[];

  // Menu settings
  default_language: Language;
  supported_languages: Language[];
  currency: string; // Default: 'EUR'
  cover_charge: number; // DECIMAL

  // Subscription
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  max_dishes: number;
  max_categories: number;

  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}


/**
 * Categoria menu (tenant-specific)
 */
export interface CategoryDB {
  id: string; // UUID
  tenant_id: string; // UUID ref to tenants.id

  name: string;
  slug: string;
  description?: string;

  display_order: number;
  is_visible: boolean;

  created_at: string;
  updated_at: string;
}

/**
 * Piatto (tenant-specific)
 */
export interface DishDB {
  id: string; // UUID
  tenant_id: string; // UUID ref to tenants.id
  category_id: string; // UUID ref to categories.id

  name: string;
  description: string;
  slug: string;

  price: number; // DECIMAL(10,2)
  image_url: string | null; // Supabase Storage URL

  is_visible: boolean;
  is_seasonal: boolean;
  seasonal_note?: string; // JSONB
  is_gluten_free: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;

  allergen_ids: string[]; // Array of Strings (New Schema)

  display_order: number;

  created_at: string;
  updated_at: string;
}

/**
 * Allergen (global data)
 */
export interface AllergenDB {
  id: string; // Text: glutine, lattosio, etc.
  number: number; // 1-14 (EU)
  icon: string; // Emoji
  name: string;
  description?: string;
  created_at: string;
}


// ============================================================
// TYPES: Menu completo con relazioni (per query)
// ============================================================

/**
 * Piatto con allergeni embedded
 */
export interface DishWithAllergens extends DishDB {
  allergens: AllergenDB[];
}

/**
 * Categoria con piatti embedded
 */
export interface CategoryWithDishes extends CategoryDB {
  dishes: DishWithAllergens[];
}

/**
 * Menu completo di un tenant
 */
export interface TenantMenu {
  tenant: Tenant;
  categories: CategoryWithDishes[];
}

// ============================================================
// TYPES: Forms & UI
// ============================================================

/**
 * Form input per creazione categoria
 */
export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  is_visible?: boolean;
}

/**
 * Form input per creazione piatto
 */
export interface DishInput {
  category_id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  image_url?: string;
  allergen_ids?: string[];
  is_seasonal?: boolean;
  seasonal_note?: string;
  is_gluten_free?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_visible?: boolean;
  display_order?: number;
}

/**
 * Form input per tenant settings
 */
export interface TenantSettingsInput {
  restaurant_name?: string;
  slug?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  city?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  default_language?: Language;
  supported_languages?: Language[];
  cover_charge?: number;
}

/**
 * Slug validation result
 */
export interface SlugValidation {
  isValid: boolean;
  isUnique: boolean;
  suggestedSlug?: string;
  error?: string;
}

