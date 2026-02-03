import { Component, OnInit, inject } from '@angular/core';

import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModalComponent } from '../../../../shared/components/shared-modal/shared-modal.component';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { Professional } from '../../models/project.models';

export interface AddMemberDialogData {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-add-member-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SharedModalComponent,
  ],
  templateUrl: './add-member-modal.component.html',
  styleUrl: './add-member-modal.component.scss',
})
export class AddMemberModalComponent implements OnInit {
  dialogRef = inject<MatDialogRef<AddMemberModalComponent>>(MatDialogRef);
  data = inject<AddMemberDialogData>(MAT_DIALOG_DATA);

  private readonly projectService = inject(ProjectService);

  searchControl = new FormControl('');
  roleControl = new FormControl('worker', [Validators.required]);

  searchResults: Professional[] = [];
  selectedProfessionals: Professional[] = [];
  loading = false;
  submitting = false;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.searchResults = [];
            return [];
          }
          this.loading = true;
          return this.projectService.getProfessionals(
            query,
            this.data.projectId,
          );
        }),
      )
      .subscribe({
        next: (results) => {
          this.searchResults = results.filter(
            (p: Professional) =>
              !this.selectedProfessionals.some((sp) => sp.id === p.id),
          );
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  selectProfessional(professional: Professional): void {
    if (!this.selectedProfessionals.find((p) => p.id === professional.id)) {
      this.selectedProfessionals.push(professional);
    }
    this.searchControl.setValue('');
    this.searchResults = [];
  }

  removeProfessional(professional: Professional): void {
    this.selectedProfessionals = this.selectedProfessionals.filter(
      (p) => p.id !== professional.id,
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
    const colors = [
      '#e9c16c',
      '#4caf50',
      '#2196f3',
      '#ff9800',
      '#9c27b0',
      '#00bcd4',
      '#e91e63',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.selectedProfessionals.length === 0 || this.roleControl.invalid) {
      return;
    }

    this.submitting = true;
    const userIds = this.selectedProfessionals.map((p) => p.id);
    const role = this.roleControl.value!;

    this.projectService
      .addProjectMembers(this.data.projectId, userIds, role)
      .subscribe({
        next: (result) => {
          this.submitting = false;
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.submitting = false;
          console.error('Error adding members:', error);
        },
      });
  }
}
