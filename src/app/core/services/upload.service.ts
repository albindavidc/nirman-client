import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** Shape returned by the backend presigned URL endpoint */
export interface PresignedUrlResponse {
  uploadUrl: string;
  viewUrl: string;
  key: string;
}

/** Result returned to callers after a successful upload */
export interface UploadResult {
  viewUrl: string;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/api/v1/upload`;

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Ask the backend for a presigned URL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calls the backend to generate a short-lived (60 s) presigned PUT URL and
   * a long-lived (7-day) presigned GET view URL.
   *
   * @param fileName Original file name (extension is preserved by the backend)
   * @param fileType MIME type, e.g. 'image/jpeg'
   * @param uploadType Folder bucket: 'profile' or 'document' (default)
   */
  getPresignedUrl(
    fileName: string,
    fileType: string,
    uploadType: 'profile' | 'document' = 'document',
  ): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.baseUrl}/presigned-url`,
      { fileName, fileType, uploadType },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Upload directly to S3 using the presigned PUT URL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Uploads a raw File object directly to the S3 presigned URL.
   *
   * IMPORTANT: We intentionally use the native `fetch` API here (wrapped in an
   * Observable via `from()`), NOT Angular's `HttpClient`. Angular's HttpClient
   * interceptors may add an `Authorization` header, which invalidates the
   * presigned URL signature and causes S3 to return a 403 SignatureDoesNotMatch
   * error.
   *
   * @param uploadUrl Presigned PUT URL received from Step 1
   * @param file      File object to upload
   */
  uploadToS3(uploadUrl: string, file: File): Observable<void> {
    const request = fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        // S3 uses Content-Type to set the stored object's content type;
        // it must match the value used when generating the presigned URL.
        'Content-Type': file.type,
      },
      body: file,
    }).then((response) => {
      if (!response.ok) {
        throw new Error(
          `S3 upload failed – HTTP ${response.status}: ${response.statusText}`,
        );
      }
    });

    return from(request);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Combined helper (Steps 1 + 2 in one call)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Convenience method that:
   *  1. Requests a presigned URL from the backend
   *  2. Uploads the file directly to S3
   *  3. Returns `{ viewUrl, key }` so callers can persist the reference
   *
   * Usage in FilePond's `process` callback or any component:
   * ```ts
   * this.uploadService.uploadFile(file, 'document').subscribe({
   *   next: ({ viewUrl, key }) => { ... },
   *   error: (err) => { ... },
   * });
   * ```
   */
  uploadFile(
    file: File,
    uploadType: 'profile' | 'document' = 'document',
  ): Observable<UploadResult> {
    return this.getPresignedUrl(file.name, file.type, uploadType).pipe(
      switchMap((presigned) =>
        this.uploadToS3(presigned.uploadUrl, file).pipe(
          map(() => ({
            viewUrl: presigned.viewUrl,
            key: presigned.key,
          })),
        ),
      ),
      catchError((err) => {
        console.error('[UploadService] Upload failed:', err);
        return throwError(() => err);
      }),
    );
  }
}

