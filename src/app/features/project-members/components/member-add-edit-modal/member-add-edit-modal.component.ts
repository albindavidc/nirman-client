import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatIconModule } from '@angular/material/icon'; // Added MatIconModule
import { Store } from '@ngrx/store';
import { Member } from '../../models/member.model';
import * as MemberActions from '../../store/member.actions';

@Component({
  selector: 'app-member-add-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './member-add-edit-modal.component.html',
  styleUrl: './member-add-edit-modal.component.scss',
})
export class MemberAddEditModalComponent implements OnInit {
  form: FormGroup;
  mode: 'add' | 'edit' = 'add';
  isProfessional = false;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    public dialogRef: MatDialogRef<MemberAddEditModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'add' | 'edit'; member?: Member }
  ) {
    this.mode = data.mode;
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['worker', Validators.required],
      // Professional fields
      professionalTitle: [''],
      experienceYears: [0],
      skills: [''], // Comma separated string for simplicity in form
      addressStreet: [''],
      addressCity: [''],
      addressState: [''],
      addressZipCode: [''],
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data.member) {
      const { member } = this.data;
      this.form.patchValue({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phoneNumber, // map phoneNumber to phone form control
        role: member.role,
        professionalTitle: member.professionalTitle,
        experienceYears: member.experienceYears,
        skills: member.skills ? member.skills.join(', ') : '',
        addressStreet: member.addressStreet,
        addressCity: member.addressCity,
        addressState: member.addressState,
        addressZipCode: member.addressZipCode,
      });

      if (member.role === 'professional') {
        this.isProfessional = true;
      }
    }

    this.form.get('role')?.valueChanges.subscribe((role) => {
      this.isProfessional = role === 'professional';
      // Toggle validators if needed, but for now optional in backend command so optional in form is fine.
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      // Map form fields to backend expected format
      const memberData = {
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
        this.store.dispatch(MemberActions.addMember({ member: memberData }));
      } else {
        if (this.data.member) {
          this.store.dispatch(
            MemberActions.editMember({
              id: this.data.member.id,
              member: memberData,
            })
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
