/// <reference types="vite/client" />

// Declaration-merges onto Vite's own ImportMetaEnv (which brings MODE/DEV/PROD/BASE_URL and
// import.meta.hot/glob) rather than replacing it, while still typing our two custom vars strictly.
interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_API_KEY: string;
}
