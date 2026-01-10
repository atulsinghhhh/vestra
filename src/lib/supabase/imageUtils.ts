
import { createClient } from "./client";

export const getPublicImageUrl = async (path: string | undefined, bucket: string = "private"): Promise<string | null> => {
    if (!path) return null;

    if (path.startsWith("http") || path.startsWith("blob:")) {
        return path;
    }

    const supabase = createClient();
    
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, 3600);

    if (error) {
        console.error(`Error creating signed URL from bucket '${bucket}':`, error);
        return null;
    }

    return data.signedUrl;
};

export const preloadImages = (urls: (string | undefined)[]) => {
    if (typeof window === "undefined") return;
    
    urls.forEach((url) => {
        if (url) {
            const img = new Image();
            img.src = url;
        }
    });
};
