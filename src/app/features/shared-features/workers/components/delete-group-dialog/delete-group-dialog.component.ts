import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

export interface DeleteGroupDialogData {
  groupName: string;
}

@Component({
  selector: 'app-delete-group-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './delete-group-dialog.component.html',
  styleUrl: './delete-group-dialog.component.scss',
})
export class DeleteGroupDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteGroupDialogComponent>);
  readonly data = inject<DeleteGroupDialogData>(MAT_DIALOG_DATA);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
