import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  get apiBaseUrl(): string {
    return process.env['NG_APP_API_BASE_URL'] || 'http://localhost:3000';
  }

  get apiVersion(): string {
    return process.env['NG_APP_API_VERSION'] || 'v1';
  }

  get apiUrl(): string {
    return `${this.apiBaseUrl}/api/${this.apiVersion}`;
  }

  get awsRegion(): string {
    return process.env['NG_APP_AWS_REGION'] || '';
  }

  get s3BucketName(): string {
    return process.env['NG_APP_S3_BUCKET_NAME'] || '';
  }

  get googleMapsApiKey(): string {
    return process.env['NG_APP_GOOGLE_MAPS_API_KEY'] || '';
  }
}
