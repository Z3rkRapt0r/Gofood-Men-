'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';
import {
    LayoutDashboard,
    Folder,
    UtensilsCrossed,
    Palette,
    HelpCircle,
    User,
    LogOut,
    Store,
    Image as ImageIcon,
    ShieldAlert
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar';
import { AnimateIcon } from '@/components/ui/animate-icon';

export function AppSidebar({ tenant }: { tenant: Tenant }) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    }

    const items = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Categorie', url: '/dashboard/categories', icon: Folder },
        { title: 'Piatti', url: '/dashboard/dishes', icon: UtensilsCrossed },
        { title: 'Immagini', url: '/dashboard/media', icon: ImageIcon },
        { title: 'Allergeni', url: '/dashboard/allergens', icon: ShieldAlert },

        { title: 'Design Studio', url: '/dashboard/design-studio', icon: Palette },
        { title: 'Assistenza', url: '/dashboard/support', icon: HelpCircle },
        { title: 'Account', url: '/dashboard/account', icon: User },
    ];

    return (
        <Sidebar className="bg-white border-r">
            <SidebarHeader className="h-16 flex items-center justify-center border-b px-6 bg-white">
                <img
                    src="https://sgdxmtqrjgxuajxxvajf.supabase.co/storage/v1/object/sign/Go%20Food/gofood-logoHD.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNzE5MDI4MC1kOTI1LTQ2YmQtOTFhMC0wMTIzZTlmZDY0MDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHbyBGb29kL2dvZm9vZC1sb2dvSEQuc3ZnIiwiaWF0IjoxNzY0Nzk5OTg0LCJleHAiOjIwODAxNTk5ODR9.u0xvBk9SohQ53303twe_gKZ87_Bj2ga3dD1HauBaevk"
                    alt="GO! FOOD"
                    className="h-10 w-auto object-contain"
                />
            </SidebarHeader>

            <SidebarContent className="bg-white">
                {/* Restaurant Info */}
                <div className="p-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 border border-orange-100">
                        {tenant.logo_url ? (
                            <img
                                src={tenant.logo_url}
                                alt={tenant.restaurant_name}
                                className="w-10 h-10 rounded-md object-contain bg-white border border-gray-100"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200 shrink-0">
                                <Store className="w-5 h-5" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-gray-900 truncate">
                                {tenant.restaurant_name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                                /{tenant.slug || '...'}
                            </p>
                        </div>
                    </div>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className={`h-10 transition-all ${pathname === item.url
                                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-bold'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Link
                                            href={item.url}
                                            className="flex items-center gap-3"
                                        >
                                            <AnimateIcon icon={item.icon} className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t bg-white p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 w-full justify-start h-10"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            <span>Esci</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
