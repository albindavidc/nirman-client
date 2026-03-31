import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, BehaviorSubject, map, shareReplay } from 'rxjs';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// FilePond Imports
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

import { UploadService } from '../../../../../../core/services/upload.service';
import { ProjectService } from '../../../services/project.service';
import { ProjectPhaseService } from '../../../services/project-phase.service';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

@Component({
  selector: 'app-phase-approval',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FilePondModule,
  ],
  templateUrl: './phase-approval.component.html',
  styleUrls: ['./phase-approval.component.scss'],
})
export class PhaseApprovalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private projectService = inject(ProjectService);
  private projectPhaseService = inject(ProjectPhaseService);
  private uploadService = inject(UploadService);

  projectId: string | null = null;
  phaseId: string | null = null;
  
  phaseInfo$: Observable<any> = of(null);
  comments: string = '';
  isSubmitting = false;

  // FilePond Upload State
  uploadedMedia: { type: string; url: string }[] = [];
  pondOptions: FilePondOptions = {
    allowMultiple: true,
    maxFiles: 10,
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
      process: (fieldName: string, file: Blob, metadata: any, load: (id: string) => void, error: (msg: string) => void, _progress: any, abort: () => void) => {
        const sub = this.uploadService.uploadFile(file as File, 'document').subscribe({
          next: ({ viewUrl }) => {
            const mediaType = (file as File).type.startsWith('video') ? 'video' : 'image';
            this.uploadedMedia.push({ type: mediaType, url: viewUrl });
            load(viewUrl);
          },
          error: (err: any) => error(err.message || 'Upload failed'),
        });
        return { abort: () => { sub.unsubscribe(); abort(); } };
      },
      revert: (uniqueFileId: string, load: () => void, _error: any) => {
        this.uploadedMedia = this.uploadedMedia.filter(m => m.url !== uniqueFileId);
        load();
      },
    },
  };

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.phaseId = this.route.snapshot.paramMap.get('phaseId');

    if (this.projectId && this.phaseId) {
      this.phaseInfo$ = this.projectPhaseService.getPhases(this.projectId).pipe(
        map(phases => {
          const phase = phases.find(p => p.id === this.phaseId);
          return phase ? { ...phase, projectId: this.projectId, projectName: 'Project Work' } : null;
        }),
        shareReplay(1)
      );
    }
  }

  submitRequest(): void {
    if (this.comments && this.projectId && this.phaseId) {
      this.isSubmitting = true;
      this.projectPhaseService.requestApproval(this.projectId, this.phaseId, {
        comments: this.comments,
        media: this.uploadedMedia
      }).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/supervisor/projects', this.projectId]);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Failed to submit request', err);
        }
      });
    }
  }
}

