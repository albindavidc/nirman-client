export const environment = {
  production: true,
  apiUrl: 'https://api.nirman.albindavidc.com',
  api: {
    baseUrl: 'https://api.nirman.albindavidc.com',
    version: 'v1',
  },
  aws: {
    region: 'eu-north-1',
    s3BucketName: 'nirman-dev',
  },
  google: {
    mapsApiKey: import.meta.env['NG_APP_GOOGLE_MAPS_API_KEY'],
  },
};
