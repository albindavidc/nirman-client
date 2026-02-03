import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';
import {
  Profile,
  UpdateProfileDto,
  UpdatePasswordDto,
} from '../models/profile.model';

interface PresignedUrlResponse {
  uploadUrl: string; // URL for PUT request
  viewUrl: string; // URL for viewing request
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private readonly apiUrl = `${this.configService.apiUrl}/profile`;
  private readonly uploadUrl = `${this.configService.apiUrl}/upload`;

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateProfile(dto: UpdateProfileDto): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, dto);
  }

  updatePassword(dto: UpdatePasswordDto): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, dto);
  }

  /**
   * Upload profile photo to S3 using presigned URL.
   * Flow:
   * 1. Get presigned URL from backend
   * 2. Upload file directly to S3
   * 3. Return the S3 key for saving to profile
   */
  uploadProfilePhoto(file: File): Observable<{ url: string; key: string }> {
    // Step 1: Get presigned URL from backend
    return this.getPresignedUrl(file.name, file.type).pipe(
      switchMap((presignedResponse) => {
        // Step 2: Upload file directly to S3 using uploadUrl
        return new Observable<{ url: string; key: string }>((observer) => {
          fetch(presignedResponse.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          })
            .then((response) => {
              if (response.ok) {
                // Step 3: Return the viewUrl for the uploaded file
                observer.next({
                  url: presignedResponse.viewUrl,
                  key: presignedResponse.key,
                });
                observer.complete();
              } else {
                observer.error(new Error('Failed to upload to S3'));
              }
            })
            .catch((error) => {
              observer.error(error);
            });
        });
      })
    );
  }

  /**
   * Get presigned URL from backend for S3 upload.
   */
  private getPresignedUrl(
    fileName: string,
    fileType: string
  ): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.uploadUrl}/presigned-url`,
      {
        fileName,
        fileType,
        uploadType: 'profile',
      }
    );
  }
}
