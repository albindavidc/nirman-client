import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { debounceTime, distinctUntilChanged, switchMap, of, tap } from 'rxjs';

import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';
import { ProjectService } from '../../services/project.service';
import { WorkerService } from '../../../workers/services/worker.service';
import { Worker } from '../../../workers/models/worker.model';
import { Professional } from '../../models/project.models';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

export interface WorkerModalData {
  mode: 'create' | 'edit';
  projectId: string;
  projectName?: string;
  worker?: {
    userId: string;
    userName: string;
    currentRole: string;
  };
}

@Component({
  selector: 'app-worker-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    SharedModalComponent,
  ],
  templateUrl: './worker-modal.component.html',
  styleUrl: './worker-modal.component.scss',
})
export class WorkerModalComponent implements OnInit {
  dialogRef = inject<MatDialogRef<WorkerModalComponent>>(MatDialogRef);
  data = inject<WorkerModalData>(MAT_DIALOG_DATA);
  
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private workerService = inject(WorkerService);
  private notificationService = inject(NotificationService);

  mode: 'create' | 'edit' = 'create';
  
  // Tab handling for Create Mode
  activeTabIndex = 0;

  // Search Existing Logic
  searchControl = new FormControl('');
  existingRoleControl = new FormControl('Worker', [Validators.required]);
  searchResults: Professional[] = [];
  selectedProfessionals: Professional[] = [];
  loadingSearch = false;

  // Create New Logic (incorporating Prisma fields)
  createForm!: FormGroup;

  // Edit Logic
  editRoleControl = new FormControl('', [Validators.required]);

  submitting = false;

  ngOnInit(): void {
    this.mode = this.data.mode;

    if (this.mode === 'create') {
      this.initSearchLogic();
      this.initCreateForm();
    } else if (this.mode === 'edit') {
      if (this.data.worker) {
        this.editRoleControl.setValue(this.data.worker.currentRole);
      }
    }
  }

  private initSearchLogic(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.searchResults = [];
            this.loadingSearch = false;
            return of([]);
          }
          this.loadingSearch = true;
          return this.projectService.getProfessionals(query, this.data.projectId);
        })
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results.filter(
            (p) => !this.selectedProfessionals.some((sp) => sp.id === p.id)
          );
          this.loadingSearch = false;
        },
        error: () => {
          this.loadingSearch = false;
        },
      });
  }

  private initCreateForm(): void {
    this.createForm = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.nameValidator(2), CustomValidators.maxTrimmedLength(50)]],
      lastName: ['', [Validators.required, CustomValidators.nameValidator(2), CustomValidators.maxTrimmedLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, CustomValidators.indianMobile()]],
      role: ['Worker', Validators.required],
      
      // Professional Fields from Prisma
      professionalTitle: ['', [CustomValidators.maxTrimmedLength(100)]],
      experienceYears: [0, [CustomValidators.experienceYears()]],
      skills: ['', [CustomValidators.maxTrimmedLength(500)]], // comma separated
      addressStreet: ['', [CustomValidators.addressField(150)]],
      addressCity: ['', [CustomValidators.addressField(50)]],
      addressState: ['', [CustomValidators.addressField(50)]],
      addressZipCode: ['', [CustomValidators.indianPinCode()]],
    });
  }

  // --- Search Existing Helpers ---
  selectProfessional(professional: Professional): void {
    if (!this.selectedProfessionals.find((p) => p.id === professional.id)) {
      this.selectedProfessionals.push(professional);
    }
    this.searchControl.setValue('');
    this.searchResults = [];
  }

  removeProfessional(professional: Professional): void {
    this.selectedProfessionals = this.selectedProfessionals.filter(
      (p) => p.id !== professional.id
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#e9c16c', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63'];
    return colors[name.charCodeAt(0) % colors.length];
  }

  // --- Actions ---
  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.mode === 'create') {
      if (this.activeTabIndex === 0) {
        this.submitSearchExisting();
      } else {
        this.submitCreateNew();
      }
    } else {
      this.submitEdit();
    }
  }

  private submitSearchExisting(): void {
    if (this.selectedProfessionals.length === 0 || this.existingRoleControl.invalid) return;

    this.submitting = true;
    const userIds = this.selectedProfessionals.map((p) => p.id);
    const role = this.existingRoleControl.value!;

    this.projectService.addProjectWorkers(this.data.projectId, userIds, role).subscribe({
      next: (result) => {
        this.submitting = false;
        this.notificationService.success('Worker(s) added successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.submitting = false;
        this.notificationService.error('Error adding workers');
      },
      complete: () => (this.submitting = false)
    });
  }

  private submitCreateNew(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.createForm.value;

    const workerData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      role: 'professional', // backend global role
      professionalTitle: formValue.professionalTitle || undefined,
      experienceYears: formValue.experienceYears || undefined,
      skills: formValue.skills
        ? formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : undefined,
      addressStreet: formValue.addressStreet || undefined,
      addressCity: formValue.addressCity || undefined,
      addressState: formValue.addressState || undefined,
      addressZipCode: formValue.addressZipCode || undefined,
    };

    const projectRole = formValue.role;

    this.workerService.addWorker(workerData as Partial<Worker>).pipe(
      switchMap((newWorker: Worker) => this.projectService.addProjectWorkers(this.data.projectId, [newWorker.id], projectRole))
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.notificationService.success('New worker created and added successfully');
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        this.submitting = false;
        this.notificationService.error('Error creating new worker');
      }
    });
  }

  private submitEdit(): void {
    if (this.editRoleControl.invalid || !this.data.worker) return;

    this.submitting = true;
    const newRole = this.editRoleControl.value!;

    this.projectService.updateProjectWorker(this.data.projectId, this.data.worker.userId, newRole).subscribe({
      next: () => {
        this.submitting = false;
        this.notificationService.success('Worker role updated successfully');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error('Failed to update worker role');
      },
      complete: () => (this.submitting = false)
    });
  }
}
