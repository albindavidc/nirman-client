import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { CustomValidators } from '../../../../../../shared/validators/custom-validators';
import { SharedModalComponent } from '../../../../../../shared/components/shared-modal/shared-modal.component';

@Component({
  selector: 'app-request-approval-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SharedModalComponent,
  ],
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
})
export class RequestApprovalModalComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<RequestApprovalModalComponent>);
  public data = inject<{ phaseName: string }>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    comments: ['', [CustomValidators.noWhitespace()]],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
