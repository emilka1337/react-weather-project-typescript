interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_API_KEY: string;
    readonly VITE_IPINFO_API_TOKEN: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}