import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MasterMaterialService } from '../../../services/master-material.service';
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
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
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
  submitSuccess = false;

  // Categories with color indicators
  categories = [
    { value: 'Building Materials', label: 'Building Materials', color: 'gold',  icon: 'domain' },
    { value: 'Structural',         label: 'Structural',         color: 'blue',  icon: 'foundation' },
    { value: 'Electrical',         label: 'Electrical',         color: 'gold',  icon: 'bolt' },
    { value: 'Plumbing',           label: 'Plumbing',           color: 'blue',  icon: 'plumbing' },
    { value: 'Finishing',          label: 'Finishing',          color: 'green', icon: 'format_paint' },
    { value: 'Mechanical',         label: 'Mechanical',         color: 'blue',  icon: 'settings' },
    { value: 'Safety',             label: 'Safety',             color: 'gold',  icon: 'health_and_safety' },
    { value: 'Other',              label: 'Other',              color: 'green', icon: 'category' },
  ];

  // Unit quick-picks
  commonUnits = ['KG', 'Bag', 'Ton', 'Piece', 'Litre', 'Meter'];
  showCustomUnit = signal(false);

  // Progress tracking logic
  progressPills = computed(() => {
    if (!this.materialForm) return [false, false, false, false, false];
    const controls = ['code', 'name', 'category', 'unit', 'description'];
    return controls.map(c => this.materialForm.get(c)?.valid && this.materialForm.get(c)?.value !== '');
  });

  // Description character counter
  descLength = signal(0);

  ngOnInit(): void {
    this.isEditMode = !!this.data?.material;
    this.initForm();
    
    this.materialForm.get('description')?.valueChanges.subscribe(val => {
      this.descLength.set(val?.length || 0);
    });

    this.materialForm.get('unit')?.valueChanges.subscribe(val => {
      if (val && !this.commonUnits.includes(val)) {
        this.showCustomUnit.set(true);
      }
    });
  }

  private initForm(): void {
    const material = this.data?.material;
    this.materialForm = this.fb.group({
      name: [material?.name || '', [Validators.required]],
      code: [
        { value: material?.code || '', disabled: this.isEditMode },
        [Validators.required, Validators.pattern(/^[A-Z0-9-]{3,10}$/)],
      ],
      category: [material?.category || '', [Validators.required]],
      unit: [material?.unit || '', [Validators.required]],
      description: [material?.description || '', [Validators.maxLength(500)]],
    });
  }

  selectUnit(unit: string): void {
    if (unit === 'Other') {
      this.showCustomUnit.set(true);
      this.materialForm.patchValue({ unit: '' });
    } else {
      this.showCustomUnit.set(false);
      this.materialForm.patchValue({ unit: unit });
    }
  }

  onSubmit(): void {
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.materialForm.getRawValue();

    if (this.isEditMode) {
      // Backend UpdateMasterMaterialDto does not accept 'code'
      delete formValue.code;
    }

    const request$ = this.isEditMode 
      ? this.materialService.update(this.data.material.id, formValue)
      : this.materialService.create(formValue);

    request$.subscribe({
      next: () => {
        this.submitSuccess = true;
        this.notificationService.success(`Material ${this.isEditMode ? 'updated' : 'created'} successfully`);
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 800);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} material`);
        this.isSubmitting = false;
        console.error(err);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldValid(field: string): boolean {
    const control = this.materialForm.get(field);
    return !!(control?.valid && (control?.dirty || control?.touched));
  }

  hasFieldError(field: string, errorType: string): boolean {
    const control = this.materialForm.get(field);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  getSelectedCategory() {
    const value = this.materialForm.get('category')?.value;
    return this.categories.find(c => c.value === value) ?? null;
  }
}
