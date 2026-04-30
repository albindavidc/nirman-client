interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly NG_APP_GOOGLE_MAPS_API_KEY: string;
  readonly [key: string]: string;
}
