import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  get apiBaseUrl(): string {
    return environment.api.baseUrl;
  }

  get apiVersion(): string {
    return environment.api.version;
  }

  get apiUrl(): string {
    return `${this.apiBaseUrl}/api/${this.apiVersion}`;
  }

  get awsRegion(): string {
    return environment.aws.region;
  }

  get s3BucketName(): string {
    return environment.aws.s3BucketName;
  }

  get googleMapsApiKey(): string {
    return environment.google.mapsApiKey;
  }
}
