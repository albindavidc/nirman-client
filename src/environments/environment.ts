export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  api: {
    baseUrl: 'http://localhost:3000',
    version: 'v1',
  },
  aws: {
    region: 'eu-north-1',
    s3BucketName: 'nirman-dev',
  },
  google: {
    mapsApiKey: import.meta.env['NG_APP_GOOGLE_MAPS_API_KEY'] || '',
  },
};
