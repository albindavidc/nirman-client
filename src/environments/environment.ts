export const environment = {
  production: false,
  apiUrl: process.env['NG_APP_API_BASE_URL'] || 'http://localhost:3000',

  api: {
    baseUrl: process.env['NG_APP_API_BASE_URL'] || 'http://localhost:3000',
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
