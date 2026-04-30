declare const process: {
  env: {
    NG_APP_API_BASE_URL: string;
    NG_APP_API_VERSION: string;
    NG_APP_AWS_REGION: string;
    NG_APP_S3_BUCKET_NAME: string;
    NG_APP_GOOGLE_MAPS_API_KEY: string;
    NEXT_PUBLIC_API_URL: string;
    CORS_ORIGIN: string;
    [key: string]: string;
  };
};
