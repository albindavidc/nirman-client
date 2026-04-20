import { Component, inject, OnInit } from '@angular/core';
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
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Task } from '../../projects/services/task.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModalComponent } from '../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

export interface WorkerTaskModalData {
  mode: 'start' | 'update';
  task: Task;
}

@Component({
  selector: 'app-worker-task-modal',
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
  templateUrl: './worker-task-modal.component.html',
  styleUrl: './worker-task-modal.component.scss',
})
export class WorkerTaskModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<WorkerTaskModalComponent>);
  public data = inject<WorkerTaskModalData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  startTime = '';

  ngOnInit() {
    this.initForm();
    if (this.data.mode === 'start') {
      const now = new Date();
      this.startTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  }

  private initForm() {
    if (this.data.mode === 'start') {
      this.form = this.fb.group({
        notes: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
      });
    } else {
      this.form = this.fb.group({
        progress: [
          this.data.task.progress || 0,
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        status: [this.data.task.status || 'In Progress', Validators.required],
        notes: [this.data.task.notes || '', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
