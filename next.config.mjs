/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'nizhsrbjmsoauqohujmk.supabase.co',
            }
        ],
    },
};

export default nextConfig;
