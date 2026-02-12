import { Component, inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';

export interface EditMemberDialogData {
  projectId: string;
  userId: string;
  userName: string;
  currentRole: string;
}

@Component({
  selector: 'app-edit-member-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    SharedModalComponent,
  ],
  templateUrl: './edit-member-modal.component.html',
  styleUrl: './edit-member-modal.component.scss',
})
export class EditMemberModalComponent {
  dialogRef = inject<MatDialogRef<EditMemberModalComponent>>(MatDialogRef);
  data = inject<EditMemberDialogData>(MAT_DIALOG_DATA);

  private readonly projectService = inject(ProjectService);

  roleControl = new FormControl('', [Validators.required]);
  loading = false;

  constructor() {
    if (this.data.currentRole) {
      this.roleControl.setValue(this.data.currentRole);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.roleControl.invalid) return;

    this.loading = true;
    const newRole = this.roleControl.value!;

    this.projectService
      .updateProjectMember(this.data.projectId, this.data.userId, newRole)
      .subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.loading = false;
          console.error('Failed to update role', err);
          // Ideally show snackbar here
        },
      });
  }
}
