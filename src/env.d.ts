/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_URL?: string;
  readonly VITE_SITE_URL?: string;
  /** Legacy; prefer `VITE_WHATSAPP_URL` in Vite. */
  readonly NEXT_PUBLIC_WHATSAPP_URL?: string;
  /** Legacy; prefer `VITE_SITE_URL` in Vite. */
  readonly NEXT_PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
