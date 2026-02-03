import { Component, inject } from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { SharedModalComponent } from '../shared-modal/shared-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ReasonDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-reason-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    SharedModalComponent,
  ],
  templateUrl: './reason-dialog.component.html',
  styleUrl: './reason-dialog.component.scss',
})
export class ReasonDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ReasonDialogComponent>);
  readonly data = inject<ReasonDialogData>(MAT_DIALOG_DATA);

  reasonControl = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
  ]);

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.reasonControl.valid) {
      this.dialogRef.close(this.reasonControl.value);
    }
  }
}
