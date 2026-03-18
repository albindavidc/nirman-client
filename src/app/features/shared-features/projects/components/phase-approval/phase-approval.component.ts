import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import * as ProjectActions from '../../store/project.actions';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';
import { ProjectService } from '../../services/project.service';
import { ProjectPhaseService } from '../../services/project-phase.service';
import { Professional, PhaseApproval } from '../../models/project.models';

@Component({
  selector: 'app-phase-approval',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './phase-approval.component.html',
  styleUrls: ['./phase-approval.component.scss'],
})
export class PhaseApprovalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private projectService = inject(ProjectService);
  private projectPhaseService = inject(ProjectPhaseService);

  approvalForm: FormGroup;
  phaseId: string | null = null;
  projectId: string | null = null;
  phaseName$: Observable<string> = of('');

  // Mock Professionals for 'Approved By' dropdown - ideally from store/service
  approvers$: Observable<Professional[]>;
  approvals$: Observable<PhaseApproval[]> = of([]); // TODO: Selector

  // File Upload
  selectedPhotos: File[] = [];
  selectedVideos: File[] = [];

  displayedColumns: string[] = [
    'phase',
    'approvedBy',
    'status',
    'date',
    'comments',
  ];

  constructor() {
    this.approvalForm = this.fb.group({
      phase: [{ value: '', disabled: true }],
      status: [{ value: 'Pending', disabled: true }],
      approverId: ['', Validators.required],
      comments: ['', [CustomValidators.noWhitespace()]],
      date: [new Date(), Validators.required], 
    });

    this.approvers$ = this.projectService.getProfessionals();
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.phaseId = this.route.snapshot.paramMap.get('phaseId');

    if (this.projectId && this.phaseId) {
      // Load Approvals History
      this.store.dispatch(
        ProjectActions.loadProjectApprovals({ projectId: this.projectId }),
      );
      // This should be a selector
      this.approvals$ = this.projectService.getProjectApprovals(this.projectId);

      // Get Phase Name (Bit hacky, ideally from store selector for project phases)
      // We'll rely on route param or fetch phases if not avail.
      // For now, let's assume we can find it in the project phases list if loaded,
      // OR we just display "Current Phase" if we can't easily get the name without a selector.
      // Let's try to get it from the service for now.
      // Actually, we can fetch project phases and find it.
      this.projectPhaseService.getPhases(this.projectId).subscribe((phases) => {
        const phase = phases.find((p) => p.id === this.phaseId);
        if (phase) {
          this.approvalForm.patchValue({ phase: phase.name });
        }
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files) {
      this.selectedPhotos = Array.from(files);
    }
  }

  onVideoSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files) {
      this.selectedVideos = Array.from(files);
    }
  }

  onSubmit(): void {
    if (this.approvalForm.valid && this.projectId && this.phaseId) {
      const formValue = this.approvalForm.getRawValue();

      // Mock Media Upload - In real app, upload first, get URLs
      const media = [
        ...this.selectedPhotos.map((f) => ({
          type: 'image',
          url: 'mock_url_' + f.name,
        })),
        ...this.selectedVideos.map((f) => ({
          type: 'video',
          url: 'mock_url_' + f.name,
        })),
      ];

      this.store.dispatch(
        ProjectActions.requestPhaseApproval({
          projectId: this.projectId,
          phaseId: this.phaseId,
          comments: formValue.comments,
          approverId: formValue.approverId,
          media: media,
        }),
      );

      // Navigate back after short delay or wait for success action (Effect handles success notification)
      // Ideally redirect to phases list
      setTimeout(() => {
        this.router.navigate(['../../phases'], { relativeTo: this.route });
      }, 1000);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}
