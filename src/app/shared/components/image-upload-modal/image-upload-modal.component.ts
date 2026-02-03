import { Component, EventEmitter, Output, Input, inject } from '@angular/core';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';

@Component({
  selector: 'app-image-upload-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SharedModalComponent,
  ],
  templateUrl: './image-upload-modal.component.html',
  styleUrl: './image-upload-modal.component.scss',
})
export class ImageUploadModalComponent {
  private dialogRef =
    inject<MatDialogRef<ImageUploadModalComponent>>(MatDialogRef);

  @Input() maxSizeBytes = 5 * 1024 * 1024; // 5MB default
  @Output() fileUploaded = new EventEmitter<File>();

  isDragOver = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  errorMessage: string | null = null;
  isUploading = false;

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

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    this.errorMessage = null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      return;
    }

    // Validate file size
    if (file.size > this.maxSizeBytes) {
      this.errorMessage = `File size must be less than ${
        this.maxSizeBytes / 1024 / 1024
      }MB`;
      return;
    }

    this.selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onUpload(): void {
    if (!this.selectedFile) return;
    this.dialogRef.close(this.selectedFile);
  }

  onClose(): void {
    this.dialogRef.close(null);
  }
}
