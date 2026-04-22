import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MasterMaterialService } from '../../../services/master-material.service';
import { MasterMaterial } from '../../../models/master-material.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
  selector: 'app-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './material-modal.component.html',
  styleUrls: ['./material-modal.component.scss'],
})
export class MaterialModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly materialService = inject(MasterMaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<MaterialModalComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  materialForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data?.material;
    this.initForm();
  }

  private initForm(): void {
    const material = this.data?.material;
    this.materialForm = this.fb.group({
      name: [material?.name || '', [Validators.required]],
      code: [
        { value: material?.code || '', disabled: this.isEditMode },
        [Validators.required],
      ],
      category: [material?.category || '', [Validators.required]],
      unit: [material?.unit || '', [Validators.required]],
      description: [material?.description || ''],
    });
  }

  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.materialForm.getRawValue();

    if (this.isEditMode) {
      this.materialService
        .update(this.data.material.id, formValue)
        .subscribe({
          next: () => {
            this.notificationService.success('Material updated successfully');
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.notificationService.error('Failed to update material');
            this.isSubmitting = false;
            console.error(err);
          },
        });
    } else {
      this.materialService.create(formValue).subscribe({
        next: () => {
          this.notificationService.success('Material created successfully');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Failed to create material');
          this.isSubmitting = false;
          console.error(err);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
