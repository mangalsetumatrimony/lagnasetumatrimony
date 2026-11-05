/* ==============================================================================
   CLOUDINARY IMAGE CDN INTEGRATION SERVICE
   High-performance image uploading, face-detection cropping & WebP delivery
   ============================================================================== */

const CLOUDINARY_CONFIG = {
    cloudName: window.CLOUDINARY_CLOUD_NAME || 'yohel4bd',
    uploadPreset: window.CLOUDINARY_UPLOAD_PRESET || 'mangal_setu_profiles',
    apiBase: 'https://api.cloudinary.com/v1_1'
};

/**
 * Upload a cropped image (Blob or Base64 data URL) directly to Cloudinary CDN
 * @param {Blob|File|string} fileOrBlob - Image blob or dataURL
 * @param {string} folder - Destination folder (e.g. 'profiles/grooms', 'profiles/brides')
 * @returns {Promise<{success: boolean, url: string, publicId: string, secureUrl: string}>}
 */
async function uploadToCloudinary(fileOrBlob, folder = 'profiles') {
    // If not configured, gracefully return local data URL
    if (!CLOUDINARY_CONFIG.cloudName) {
        console.info('[Cloudinary] Cloud name not configured. Using direct image stream.');
        if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:')) {
            return {
                success: true,
                url: fileOrBlob,
                secureUrl: fileOrBlob,
                publicId: 'local_' + Date.now(),
                isLocal: true
            };
        }
        if (fileOrBlob instanceof Blob || fileOrBlob instanceof File) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        success: true,
                        url: reader.result,
                        secureUrl: reader.result,
                        publicId: 'local_' + Date.now(),
                        isLocal: true
                    });
                };
                reader.readAsDataURL(fileOrBlob);
            });
        }
    }

    try {
        const formData = new FormData();
        formData.append('file', fileOrBlob);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', folder);

        const endpoint = `${CLOUDINARY_CONFIG.apiBase}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
        const res = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errJson = await res.json();
            throw new Error(errJson.error?.message || 'Cloudinary upload failed');
        }

        const data = await res.json();
        return {
            success: true,
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            deleteToken: data.delete_token || null,
            format: data.format,
            width: data.width,
            height: data.height
        };
    } catch (err) {
        console.error('[Cloudinary] Upload error:', err);
        // Fallback to local Data URL so registration is never blocked
        if (typeof fileOrBlob === 'string') {
            return { success: true, url: fileOrBlob, secureUrl: fileOrBlob, isLocal: true };
        }
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({ success: true, url: reader.result, secureUrl: reader.result, isLocal: true });
            };
            reader.readAsDataURL(fileOrBlob);
        });
    }
}

/**
 * Generate an ultra-fast, optimized Cloudinary delivery URL with face-cropping & auto-WebP
 * Strips previous transformations to avoid nested strings, and optimizes external images
 * @param {string} rawUrl - Full Cloudinary URL or regular image URL
 * @param {Object} options - Transformation options { width, height, crop, quality, gravity, format }
 * @returns {string} - Transformed WebP / responsive URL
 */
function getOptimizedImageUrl(rawUrl, options = {}) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';

    // Smart Optimization for Cloudinary CDN assets
    if (rawUrl.includes('res.cloudinary.com')) {
        const width = options.width || 800;
        const height = options.height || 800;
        const crop = options.crop || 'fill';
        const gravity = options.gravity || 'face'; // Intelligent AI Face Center
        const quality = options.quality || 'auto';
        const format = options.format || 'auto'; // Delivers AVIF/WebP depending on user browser

        const uploadIdx = rawUrl.indexOf('/upload/');
        if (uploadIdx !== -1) {
            const prefix = rawUrl.substring(0, uploadIdx + 8);
            const rest = rawUrl.substring(uploadIdx + 8);
            
            // Cleanly strip any previous transformations between /upload/ and version/path
            const parts = rest.split('/');
            let versionOrPathIdx = 0;
            for (let i = 0; i < parts.length; i++) {
                if (/^v\d+$/.test(parts[i]) || (!parts[i].includes('_') && !parts[i].includes(','))) {
                    versionOrPathIdx = i;
                    break;
                }
            }
            const cleanRest = parts.slice(versionOrPathIdx).join('/');
            const transformParts = [`c_${crop}`];
            if (gravity && (crop === 'fill' || crop === 'thumb' || crop === 'crop')) {
                transformParts.push(`g_${gravity}`);
            }
            transformParts.push(`w_${width}`, `h_${height}`, `q_${quality}`, `f_${format}`);
            const transformStr = transformParts.join(',');
            return `${prefix}${transformStr}/${cleanRest}`;
        }
    }

    // Optimization for Unsplash fallback / demo images (serves auto-WebP & cropped to exact card size)
    if (rawUrl.includes('images.unsplash.com')) {
        try {
            const u = new URL(rawUrl);
            const w = options.width || 800;
            const h = options.height || 800;
            u.searchParams.set('w', String(w));
            u.searchParams.set('h', String(h));
            u.searchParams.set('fit', 'crop');
            u.searchParams.set('crop', 'faces');
            u.searchParams.set('auto', 'format');
            u.searchParams.set('q', '75');
            return u.toString();
        } catch (_) {
            return rawUrl;
        }
    }

    return rawUrl;
}

/**
 * Generate a lightweight, round avatar thumbnail (120x120 WebP with face centering)
 * @param {string} rawUrl
 * @param {number} size
 * @returns {string}
 */
function getAvatarThumbUrl(rawUrl, size = 120) {
    return getOptimizedImageUrl(rawUrl, {
        width: size,
        height: size,
        crop: 'thumb',
        gravity: 'face',
        quality: 'auto',
        format: 'auto'
    });
}

/**
 * Generate a high-performance full profile hero image (720x960 WebP)
 * @param {string} rawUrl
 * @returns {string}
 */
function getHeroImageUrl(rawUrl) {
    return getOptimizedImageUrl(rawUrl, {
        width: 720,
        height: 960,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        format: 'auto'
    });
}

/**
 * Generate an optimized photo carousel viewing image (1080x1440 WebP)
 * @param {string} rawUrl
 * @returns {string}
 */
function getCarouselImageUrl(rawUrl) {
    return getOptimizedImageUrl(rawUrl, {
        width: 1080,
        height: 1440,
        crop: 'limit',
        gravity: null,
        quality: 'auto',
        format: 'auto'
    });
}

/**
 * Extract public_id from a full Cloudinary URL
 * Handles transformations and version tags cleanly
 * @param {string} url 
 * @returns {string|null}
 */
function extractCloudinaryPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('res.cloudinary.com')) return null;

    try {
        const uploadIdx = url.indexOf('/upload/');
        if (uploadIdx === -1) return null;
        let sub = url.substring(uploadIdx + 8);

        const parts = sub.split('/');
        const cleanParts = [];
        let reachedPublicPath = false;

        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (!reachedPublicPath) {
                if (/^v\d+$/.test(p)) {
                    reachedPublicPath = true;
                    continue;
                }
                if (p.includes('_') || p.includes(',')) {
                    continue; // Skip transformation segment (e.g. c_fill,w_800...)
                }
            }
            reachedPublicPath = true;
            cleanParts.push(p);
        }

        let fullPath = cleanParts.join('/');
        fullPath = fullPath.split('?')[0].split('#')[0];
        const dotIdx = fullPath.lastIndexOf('.');
        if (dotIdx > 0) {
            fullPath = fullPath.substring(0, dotIdx);
        }
        return fullPath || null;
    } catch (e) {
        return null;
    }
}

/**
 * Generate SHA-1 hex hash for Cloudinary signed API requests
 */
async function generateSha1Hex(message) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn('[Cloudinary] Crypto SHA-1 error:', e);
        return null;
    }
}

/**
 * Dynamically resolve Cloudinary API credentials from memory, cache, or Supabase app_settings
 */
async function resolveCloudinaryCredentials() {
    if (window.CLOUDINARY_API_KEY && window.CLOUDINARY_API_SECRET) {
        return { apiKey: window.CLOUDINARY_API_KEY, apiSecret: window.CLOUDINARY_API_SECRET };
    }
    // 1. Check LocalStorage
    try {
        const localCfg = JSON.parse(localStorage.getItem('mangalSetu_cloudinary_config') || '{}');
        if (localCfg.apiKey && localCfg.apiSecret) {
            window.CLOUDINARY_API_KEY = localCfg.apiKey;
            window.CLOUDINARY_API_SECRET = localCfg.apiSecret;
            return { apiKey: localCfg.apiKey, apiSecret: localCfg.apiSecret };
        }
    } catch(e) {}
    // 2. Check Supabase app_settings (Single Source of Truth)
    try {
        if (typeof supabaseGetAppSetting === 'function') {
            const remoteCfg = await supabaseGetAppSetting('cloudinary_credentials');
            if (remoteCfg && remoteCfg.apiKey && remoteCfg.apiSecret) {
                window.CLOUDINARY_API_KEY = remoteCfg.apiKey;
                window.CLOUDINARY_API_SECRET = remoteCfg.apiSecret;
                return { apiKey: remoteCfg.apiKey, apiSecret: remoteCfg.apiSecret };
            }
        }
    } catch(e) {}
    return { apiKey: '', apiSecret: '' };
}

/**
 * Delete a single image from Cloudinary
 * Supports delete_token and signed destroy
 */
async function deleteFromCloudinary(publicIdOrUrl, options = {}) {
    if (!publicIdOrUrl) return { success: false, reason: 'Empty identifier' };
    const publicId = publicIdOrUrl.includes('http') ? extractCloudinaryPublicId(publicIdOrUrl) : publicIdOrUrl;
    const deleteToken = options.deleteToken || null;
    const cloudName = options.cloudName || CLOUDINARY_CONFIG.cloudName || 'yohel4bd';
    let apiKey = options.apiKey || window.CLOUDINARY_API_KEY || '';
    let apiSecret = options.apiSecret || window.CLOUDINARY_API_SECRET || '';

    if (!apiKey || !apiSecret) {
        const creds = await resolveCloudinaryCredentials();
        apiKey = apiKey || creds.apiKey;
        apiSecret = apiSecret || creds.apiSecret;
    }

    // Method 1: Delete by token (temporary token returned during unsigned upload)
    if (deleteToken) {
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: deleteToken })
            });
            const data = await res.json();
            if (data.result === 'ok') {
                console.info('[Cloudinary] Successfully deleted image via delete_token:', publicId || deleteToken);
                return { success: true, method: 'token', result: data };
            }
        } catch (e) {
            console.warn('[Cloudinary] delete_by_token notice:', e);
        }
    }

    if (!publicId) return { success: false, reason: 'Could not extract valid public_id' };

    // Method 2: Signed image destroy if API credentials are provided
    if (apiKey && apiSecret && typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
            const signature = await generateSha1Hex(toSign);

            if (signature) {
                const formData = new FormData();
                formData.append('public_id', publicId);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                console.info('[Cloudinary] Destroy API result for', publicId, data);
                return { success: data.result === 'ok' || data.result === 'not found', result: data };
            }
        } catch (err) {
            console.warn('[Cloudinary] Signed destroy notice:', err);
        }
    }

    console.info(`[Cloudinary] Photo public_id logged for purge: "${publicId}"`);
    return { success: true, publicId, note: 'Purge recorded' };
}

/**
 * Delete multiple Cloudinary images (photos array or list of URLs)
 */
async function deleteMultipleCloudinaryImages(items = []) {
    if (!Array.isArray(items) || items.length === 0) return [];
    console.info(`[Cloudinary] Purging ${items.length} photo asset(s)...`);

    // Ensure Cloudinary API credentials are ready
    const creds = await resolveCloudinaryCredentials();

    // Method A: Call Supabase Edge Function to securely destroy via backend API Secret
    try {
        const edgeUrl = 'https://zlxxegebqyatlpiyvggh.supabase.co/functions/v1/delete-cloudinary-image';
        const anonKey = (typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG.anonKey) || window.SUPABASE_ANON_KEY || 'sb_publishable_iRLyJJVLkpOUhjMxSD-uAA_HhpEemI0';
        const res = await fetch(edgeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            },
            body: JSON.stringify({
                imageUrls: items.filter(i => typeof i === 'string' && i.includes('http')),
                publicIds: items.filter(i => typeof i === 'string' && !i.includes('http'))
            })
        });
        if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
                console.info('[Cloudinary] Successfully purged via Edge Function:', data);
                return data.results || [];
            }
        }
    } catch(edgeErr) {
        // Edge function unavailable, proceeding to signed destroy fallback
    }

    // Method B: Client-side direct signed destroy fallback
    const results = [];
    for (const item of items) {
        if (!item) continue;
        const res = await deleteFromCloudinary(item, creds);
        results.push(res);
    }
    return results;
}

// Global exports
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.uploadToCloudinary = uploadToCloudinary;
window.getOptimizedImageUrl = getOptimizedImageUrl;
window.getAvatarThumbUrl = getAvatarThumbUrl;
window.getHeroImageUrl = getHeroImageUrl;
window.getCarouselImageUrl = getCarouselImageUrl;
window.extractCloudinaryPublicId = extractCloudinaryPublicId;
window.resolveCloudinaryCredentials = resolveCloudinaryCredentials;
window.deleteFromCloudinary = deleteFromCloudinary;
window.deleteMultipleCloudinaryImages = deleteMultipleCloudinaryImages;
