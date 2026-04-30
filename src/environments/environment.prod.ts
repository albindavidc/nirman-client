export const environment = {
  production: true,
  apiUrl: process.env['NEXT_PUBLIC_API_URL'] || process.env['NG_APP_API_BASE_URL'] || 'https://api.nirman.albindavidc.com',
  api: {
    baseUrl: process.env['NEXT_PUBLIC_API_URL'] || process.env['NG_APP_API_BASE_URL'] || 'https://api.nirman.albindavidc.com',
    version: process.env['NG_APP_API_VERSION'] || 'v1',
  },
  aws: {
    region: process.env['NG_APP_AWS_REGION'] || 'eu-north-1',
    s3BucketName: process.env['NG_APP_S3_BUCKET_NAME'] || 'nirman-dev',
  },
  google: {
    mapsApiKey: process.env['NG_APP_GOOGLE_MAPS_API_KEY'] || '',
  },
};
