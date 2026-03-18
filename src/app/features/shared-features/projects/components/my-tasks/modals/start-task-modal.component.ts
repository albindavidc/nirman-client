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
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Task } from '../../../services/task.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';

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
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<StartTaskModalComponent>);
  public data = inject<{ task: Task }>(MAT_DIALOG_DATA);

  form = this.fb.group({
    notes: ['', [Validators.maxLength(500), CustomValidators.noWhitespace()]],
  });
  startTime = '';

  ngOnInit() {
    const now = new Date();
    this.startTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
