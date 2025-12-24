import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
export async function fetchPhotos(tenantId: string | undefined) {
    if (!tenantId) return [];
    const supabase = createClient();
    const folderPath = `${tenantId}/dishes`;

    const { data, error } = await supabase.storage
        .from('dishes')
        .list(folderPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    if (error) throw error;

    return (data || [])
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(file => {
            const { data: publicUrlData } = supabase.storage
                .from('dishes')
                .getPublicUrl(`${folderPath}/${file.name}`);
            return {
                name: file.name,
                url: publicUrlData.publicUrl,
                created_at: file.created_at,
                // @ts-ignore
                last_accessed_at: file.last_accessed_at,
                metadata: file.metadata,
                id: file.id
            };
        });
}

export function usePhotos(tenantId: string | undefined) {
    return useQuery({
        queryKey: ['photos', tenantId],
        queryFn: () => fetchPhotos(tenantId),
        enabled: !!tenantId,
    });
}



export function useUploadPhoto() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tenantId, file }: { tenantId: string, file: File }) => {
            const supabase = createClient();

            // Compression Options
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8,
            };

            let fileToUpload = file;
            try {
                // Attempt compression
                if (file.type.startsWith('image/')) {
                    console.log(`Original size: ${file.size / 1024 / 1024} MB`);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fileToUpload = await (imageCompression as any)(file, options);
                    console.log(`Compressed size: ${fileToUpload.size / 1024 / 1024} MB`);
                }
            } catch (error) {
                console.error("Image compression failed, uploading original:", error);
                // Fallback to original file
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${tenantId}/dishes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('dishes')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['photos', variables.tenantId] });
            toast.success("Foto caricata!");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Errore caricamento foto");
        }
    });
}

export function useDeletePhotos() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tenantId, photoNames }: { tenantId: string, photoNames: string[] }) => {
            const supabase = createClient();
            const filePaths = photoNames.map(name => `${tenantId}/dishes/${name}`);

            const { error } = await supabase.storage
                .from('dishes')
                .remove(filePaths);

            if (error) throw error;
            return true;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['photos', variables.tenantId] });
            toast.success(variables.photoNames.length > 1 ? "Foto eliminate" : "Foto eliminata");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Errore eliminazione foto");
        }
    });
}
