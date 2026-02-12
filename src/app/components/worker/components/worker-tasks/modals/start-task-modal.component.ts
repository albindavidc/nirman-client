import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Task } from '../../../../layouts/projects/services/task.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModalComponent } from '../../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-start-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    SharedModalComponent,
  ],
  templateUrl: './start-task-modal.component.html',
  styleUrl: './start-task-modal.component.scss',
})
export class StartTaskModalComponent implements OnInit {
  form: FormGroup;
  startTime = '';

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<StartTaskModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task },
  ) {
    this.form = this.fb.group({
      notes: [''],
    });
  }

  ngOnInit(): void {
    const now = new Date();
    this.startTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
