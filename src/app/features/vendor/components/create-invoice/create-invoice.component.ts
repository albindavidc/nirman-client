import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../../shared-features/projects/services/material.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { InvoicePrepResponseDto, CreateInvoiceDto } from '../../../../shared/models/invoice.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
})
export class CreateInvoiceComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly materialService = inject(MaterialService);
  private readonly notificationService = inject(NotificationService);

  poId = '';
  projectId = '';
  prepData?: InvoicePrepResponseDto;
  isLoading = false;

  itemsForm: FormGroup;
  detailsForm: FormGroup;

  constructor() {
    this.itemsForm = this.fb.group({
      confirmed: [false, Validators.requiredTrue],
    });

    this.detailsForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      dueDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.poId = this.route.snapshot.params['poId'];
    this.projectId = this.route.snapshot.queryParams['projectId'];

    if (!this.poId || !this.projectId) {
      this.notificationService.error('Missing PO or Project ID');
      this.goBack();
      return;
    }

    this.loadPrepData();
  }

  loadPrepData(): void {
    this.isLoading = true;
    this.materialService.getInvoicePrepData(this.projectId, this.poId).subscribe({
      next: (data) => {
        this.prepData = data;
        this.isLoading = false;
        this.itemsForm.patchValue({ confirmed: true }); // Auto-confirm since it's based on GRNs
      },
      error: () => {
        this.notificationService.error('Failed to load invoice preparation data');
        this.isLoading = false;
        this.goBack();
      },
    });
  }

  submitInvoice(): void {
    if (this.detailsForm.invalid || !this.prepData) return;

    this.isLoading = true;
    const createDto: CreateInvoiceDto = {
      invoiceNumber: this.detailsForm.value.invoiceNumber,
      poId: this.poId,
      vendorId: this.prepData.vendorId,
      currency: this.prepData.currency,
      dueDate: this.detailsForm.value.dueDate,
      items: this.prepData.billableItems.map((item) => ({
        materialId: item.materialId,
        quantity: item.acceptedQuantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        totalItemCost: item.recommendedTotal,
      })),
      attachments: [], // Placeholder for now
    };

    this.materialService.createInvoice(this.projectId, createDto).subscribe({
      next: () => {
        this.notificationService.success('Invoice submitted successfully');
        this.isLoading = false;
        this.router.navigate(['/vendor/purchase-orders']);
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to submit invoice');
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
