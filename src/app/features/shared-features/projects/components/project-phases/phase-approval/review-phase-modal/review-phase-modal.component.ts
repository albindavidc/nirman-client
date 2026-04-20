import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// FilePond Imports
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

import { ProjectPhaseService } from '../../../../services/project-phase.service';
import { SharedModalComponent } from '../../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../../shared/validators/custom-validators';
import { UploadService } from '../../../../../../../core/services/upload.service';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

export interface ReviewPhaseDialogData {
  phaseId: string;
  phaseName: string;
  mode: 'approve' | 'reject';
}

@Component({
  selector: 'app-review-phase-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SharedModalComponent,
    FilePondModule,
  ],
  templateUrl: './review-phase-modal.component.html',
  styleUrl: './review-phase-modal.component.scss',
})
export class ReviewPhaseModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef =
    inject<MatDialogRef<ReviewPhaseModalComponent>>(MatDialogRef);
  data = inject<ReviewPhaseDialogData>(MAT_DIALOG_DATA);
  private readonly phaseService = inject(ProjectPhaseService);
  private readonly uploadService = inject(UploadService);

  form!: FormGroup;
  isSubmitting = false;

  /** Accumulated uploaded media items */
  uploadedMedia: { type: string; url: string }[] = [];

  /** FilePond configuration with presigned S3 upload */
  pondOptions: FilePondOptions = {
    allowMultiple: true,
    maxFiles: 5,
    acceptedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    labelIdle:
      '<span class="filepond--label-action">Browse</span> or drag supporting evidence here',
    server: {
      process: (fieldName, file, metadata, load, error, _progress, abort) => {
        const sub = this.uploadService
          .uploadFile(file as File, 'document')
          .subscribe({
            next: ({ viewUrl }) => {
              const mediaType = (file as File).type.startsWith('image') ? 'image' : 'document';
              this.uploadedMedia.push({ type: mediaType, url: viewUrl });
              load(viewUrl);
            },
            error: (err) => error(err.message ?? 'Upload failed'),
          });

        return {
          abort: () => {
            sub.unsubscribe();
            abort();
          },
        };
      },
      revert: (uniqueFileId, load) => {
        this.uploadedMedia = this.uploadedMedia.filter(
          (m) => m.url !== uniqueFileId
        );
        load();
      },
    },
  };

  get isApproveMode(): boolean {
    return this.data.mode === 'approve';
  }

  get isRejectMode(): boolean {
    return this.data.mode === 'reject';
  }

  ngOnInit() {
    this.form = this.fb.group({
      comments: [
        '',
        this.isRejectMode
          ? [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(1000),
              CustomValidators.noWhitespace(),
            ]
          : [Validators.maxLength(1000), CustomValidators.noWhitespace()],
      ],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      approvalStatus: this.isApproveMode ? 'approved' : 'rejected',
      comments: this.form.value.comments,
      ...(this.uploadedMedia.length > 0 && { media: this.uploadedMedia }),
    };

    const request$ = this.isApproveMode
      ? this.phaseService.approvePhase(this.data.phaseId, payload)
      : this.phaseService.rejectPhase(this.data.phaseId, payload);

    request$.subscribe({
      next: () => {
        this.dialogRef.close({
          success: true,
          comments: this.form.value.comments,
        });
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

