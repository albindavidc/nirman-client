import { Component, Inject } from '@angular/core';
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
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Task } from '../../../services/task.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';

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
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UpdateProgressModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task },
  ) {
    this.form = this.fb.group({
      progress: [
        data.task.progress || 0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      status: [data.task.status || 'In Progress', Validators.required],
      notes: [data.task.notes || ''],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
