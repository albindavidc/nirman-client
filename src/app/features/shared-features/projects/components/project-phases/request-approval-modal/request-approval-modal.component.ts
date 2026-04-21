import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UploadService } from '../../../../../../core/services/upload.service';

// ── Media item model ──────────────────────────────────────────
export interface MediaItem {
  file: File;
  localUrl: string;   // immediate FileReader data-URL for preview
  viewUrl: string | null; // S3 view URL after successful upload
  isImage: boolean;
  uploading: boolean;
  error: boolean;
}

@Component({
  selector: 'app-request-approval-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
})
export class RequestApprovalModalComponent {
  public dialogRef = inject(MatDialogRef<RequestApprovalModalComponent>);
  public data = inject<{ phaseName: string }>(MAT_DIALOG_DATA);
  private uploadService = inject(UploadService);

  comments = '';
  isSubmitting = false;
  textareaFocused = false;
  currentUserRole = '';
  isDragOver = false;

  /** All selected media files with their upload state */
  mediaFiles: MediaItem[] = [];

  constructor() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserRole = user.role?.toLowerCase() || '';
    }
  }

  // ── Derived getters ──────────────────────────────────────────

  get hasUploadsInProgress(): boolean {
    return this.mediaFiles.some(m => m.uploading);
  }

  get uploadedMedia(): { type: string; url: string }[] {
    return this.mediaFiles
      .filter(m => m.viewUrl && !m.error)
      .map(m => ({ type: m.isImage ? 'image' : 'video', url: m.viewUrl! }));
  }

  // ── Drag & drop handlers ─────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(files);
  }

  // ── File selection ───────────────────────────────────────────

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.addFiles(files);
    // Reset so the same file can be re-selected if removed
    input.value = '';
  }

  private addFiles(files: File[]): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    const remaining = 5 - this.mediaFiles.length;

    files
      .filter(f => allowed.includes(f.type))
      .slice(0, remaining)
      .forEach(file => this.enqueueFile(file));
  }

  private enqueueFile(file: File): void {
    const isImage = file.type.startsWith('image/');

    const item: MediaItem = {
      file,
      localUrl: '',
      viewUrl: null,
      isImage,
      uploading: true,
      error: false,
    };

    this.mediaFiles.push(item);

    // Show preview immediately via FileReader
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        item.localUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      item.localUrl = 'video'; // placeholder
    }

    // Upload to S3
    this.uploadService.uploadFile(file, 'document').subscribe({
      next: ({ viewUrl }) => {
        item.viewUrl = viewUrl;
        item.uploading = false;
      },
      error: () => {
        item.uploading = false;
        item.error = true;
      },
    });
  }

  // ── Remove file ──────────────────────────────────────────────

  removeFile(item: MediaItem, event: Event): void {
    event.stopPropagation();
    this.mediaFiles = this.mediaFiles.filter(m => m !== item);
  }

  // ── Submit ───────────────────────────────────────────────────

  onSubmit(): void {
    if (this.comments.trim().length >= 10 && !this.hasUploadsInProgress) {
      this.isSubmitting = true;
      this.dialogRef.close({
        comments: this.comments,
        media: this.uploadedMedia,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
