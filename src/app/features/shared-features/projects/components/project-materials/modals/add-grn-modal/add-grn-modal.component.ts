import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../../../services/material.service';
import { NotificationService } from '../../../../../../../core/services/notification.service';
import { PurchaseOrderResponseDto } from '../../../../../../../shared/models/purchase-order.model';
import { ApiError } from '../../../../../../../shared/models/api.models';

@Component({
  selector: 'app-add-grn-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-grn-modal.component.html',
  styleUrls: ['./add-grn-modal.component.scss'],
})
export class AddGrnModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<AddGrnModalComponent>);
  public readonly data = inject<{ po: PurchaseOrderResponseDto; projectId: string }>(MAT_DIALOG_DATA);

  grnForm!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.grnForm = this.fb.group({
      deliveryChallanNumber: ['', Validators.required],
      recievedAt: [new Date(), Validators.required],
      inspectionStatus: ['accepted', Validators.required],
      inspectedBy: ['', Validators.required],
      inspectionNotes: [''],
      items: this.fb.array(
        this.data.po.items.map((item) =>
          this.fb.group({
            materialId: [item.materialId],
            quantityRecieved: [item.quantity, [Validators.required, Validators.min(0)]],
            quantityAccepted: [item.quantity, [Validators.required, Validators.min(0)]],
            quantityRejected: [0, [Validators.required, Validators.min(0)]],
            rejectionReason: [''],
          }),
        ),
      ),
    });
  }

  get items(): FormArray {
    return this.grnForm.get('items') as FormArray;
  }

  updateRejected(index: number): void {
    const item = this.items.at(index);
    const received = item.get('quantityRecieved')?.value || 0;
    const accepted = item.get('quantityAccepted')?.value || 0;
    const rejected = Math.max(0, received - accepted);
    item.patchValue({ quantityRejected: rejected }, { emitEvent: false });
    
    if (rejected > 0) {
        item.get('rejectionReason')?.setValidators([Validators.required]);
    } else {
        item.get('rejectionReason')?.clearValidators();
    }
    item.get('rejectionReason')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.grnForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.grnForm.value;
    
    const dto = {
      ...formValue,
      id: crypto.randomUUID(),
      poId: this.data.po.id,
      projectId: this.data.projectId,
      recievedAt: formValue.recievedAt.toISOString(),
    };

    this.materialService.createGoodsReceipt(this.data.projectId, dto).subscribe({
      next: () => {
        this.notificationService.success('GRN submitted successfully');
        this.dialogRef.close(true);
      },
      error: (err: ApiError) => {
        this.notificationService.error('Failed to submit GRN');
        this.isSubmitting = false;
        console.error(err);
      },
    });
  }
}
