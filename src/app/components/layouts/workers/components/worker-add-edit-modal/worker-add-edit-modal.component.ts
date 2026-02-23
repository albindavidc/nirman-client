import { Component, OnInit, inject } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Worker } from '../../models/worker.model';
import * as WorkerActions from '../../store/worker.actions';
import { CustomValidators } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-worker-add-edit-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './worker-add-edit-modal.component.html',
  styleUrl: './worker-add-edit-modal.component.scss',
})
export class WorkerAddEditModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  dialogRef = inject<MatDialogRef<WorkerAddEditModalComponent>>(MatDialogRef);
  data = inject<{
    mode: 'add' | 'edit';
    worker?: Worker;
  }>(MAT_DIALOG_DATA);

  form: FormGroup;
  mode: 'add' | 'edit' = 'add';
  isProfessional = false;

  constructor() {
    const data = this.data;

    this.mode = data.mode;
    this.form = this.fb.group({
      firstName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      lastName: ['', [Validators.required, CustomValidators.nameValidator(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, CustomValidators.phoneNumber()]],
      role: ['worker', Validators.required],
      // Professional fields
      professionalTitle: [''],
      experienceYears: [0, [CustomValidators.experienceYears()]],
      skills: [''], // Comma separated string for simplicity in form
      addressStreet: [''],
      addressCity: [''],
      addressState: [''],
      addressZipCode: ['', [CustomValidators.zipCode()]],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data.worker) {
      const { worker } = this.data;
      this.form.patchValue({
        firstName: worker.firstName,
        lastName: worker.lastName,
        email: worker.email,
        phone: worker.phoneNumber, // map phoneNumber to phone form control
        role: worker.role,
        professionalTitle: worker.professionalTitle,
        experienceYears: worker.experienceYears,
        skills: worker.skills ? worker.skills.join(', ') : '',
        addressStreet: worker.addressStreet,
        addressCity: worker.addressCity,
        addressState: worker.addressState,
        addressZipCode: worker.addressZipCode,
      });

      if (worker.role === 'professional') {
        this.isProfessional = true;
      }
    }

    this.form.get('role')?.valueChanges.subscribe((role) => {
      this.isProfessional = role === 'professional';
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      // Map form fields to backend expected format
      const workerData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone, // Backend expects 'phone'
        role: formValue.role,
        professionalTitle: formValue.professionalTitle || undefined,
        experienceYears: formValue.experienceYears || undefined,
        skills: formValue.skills
          ? formValue.skills
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          : undefined,
        addressStreet: formValue.addressStreet || undefined,
        addressCity: formValue.addressCity || undefined,
        addressState: formValue.addressState || undefined,
        addressZipCode: formValue.addressZipCode || undefined,
      };

      if (this.mode === 'add') {
        this.store.dispatch(WorkerActions.addWorker({ worker: workerData }));
      } else {
        if (this.data.worker) {
          this.store.dispatch(
            WorkerActions.editWorker({
              id: this.data.worker.id,
              worker: workerData,
            }),
          );
        }
      }
      this.dialogRef.close(true);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
