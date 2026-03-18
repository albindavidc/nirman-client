import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Task } from '../../../services/task.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-update-progress-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './update-progress-modal.component.html',
  styleUrl: './update-progress-modal.component.scss',
})
export class UpdateProgressModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<UpdateProgressModalComponent>);
  public data = inject<{ task: Task }>(MAT_DIALOG_DATA);

  form = this.fb.group({
    progress: [
      this.data.task.progress || 0,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    status: [this.data.task.status || 'In Progress', Validators.required],
    notes: [this.data.task.notes || '', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
  });

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
