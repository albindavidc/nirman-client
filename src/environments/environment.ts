export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  apiVersion: 'v1',
  get apiUrl(): string {
    return `${this.apiBaseUrl}/api/${this.apiVersion}`;
  },
  // AWS S3 Configuration
  awsRegion: 'eu-north-1',
  s3BucketName: 'nirman-dev',
};
