import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiError } from '../../../../../../shared/models/api.models';

// FilePond Imports
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

import { UploadService } from '../../../../../../core/services/upload.service';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

@Component({
  selector: 'app-request-approval-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FilePondModule,
  ],
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
})
export class RequestApprovalModalComponent {
  public dialogRef = inject(MatDialogRef<RequestApprovalModalComponent>);
  public data = inject<{ phaseName: string }>(MAT_DIALOG_DATA);
  private uploadService = inject(UploadService);

  uploadedMedia: { type: string; url: string }[] = [];
  comments = '';
  isSubmitting = false;

  pondOptions: FilePondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    acceptedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    labelIdle: `
      <div class="upload-container">
        <i class="material-icons upload-icon">cloud_upload</i>
        <p class="upload-text">Drag files to upload</p>
        <p class="upload-divider">or</p>
        <span class="upload-browse">Browse File</span>
        <p class="upload-info">Max file size: 100MB</p>
        <p class="upload-types">Supported types: JPG, PNG, GIF, PDF, MP4</p>
      </div>
    `,
    server: {
      process: (fieldName, file, metadata, load, error, _progress, abort) => {
        const sub = this.uploadService.uploadFile(file as File, 'document').subscribe({
          next: ({ viewUrl }) => {
            const mediaType = (file as File).type.startsWith('video') ? 'video' : 'image';
            this.uploadedMedia.push({ type: mediaType, url: viewUrl });
            load(viewUrl);
          },
          error: (err: ApiError) => error(err.message || 'Upload failed'),
        });
        return { abort: () => { sub.unsubscribe(); abort(); } };
      },
      revert: (uniqueFileId: string, load: () => void) => {
        this.uploadedMedia = this.uploadedMedia.filter(m => m.url !== uniqueFileId);
        load();
      }
    }
  };


  onSubmit(): void {
    if (this.comments.trim()) {
      this.isSubmitting = true;
      this.dialogRef.close({
        comments: this.comments,
        media: this.uploadedMedia
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

