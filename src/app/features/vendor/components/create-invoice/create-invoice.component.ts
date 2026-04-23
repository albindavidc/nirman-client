import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { startWith, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../../shared-features/projects/services/material.service';
import { ProjectService } from '../../../shared-features/projects/services/project.service';
import { Project } from '../../../shared-features/projects/models/project.models';
import { NotificationService } from '../../../../core/services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { InvoicePrepResponseDto, CreateInvoiceDto } from '../../../../shared/models/invoice.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class CreateInvoiceComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly materialService = inject(MaterialService);
  private readonly projectService = inject(ProjectService); // New injection
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  
  poId = '';
  projectId = '';
  prepData?: InvoicePrepResponseDto;
  isLoading = false;

  // BUG 1 — Required: destroy$ Subject for subscription cleanup
  private destroy$ = new Subject<void>();

  // BUG 1 — Component state
  uploadedFile: File | null = null;
  isDragOver = false;

  subTotal = 0;
  taxAmount = 0;
  totalAmount = 0;

  itemsForm: FormGroup;
  detailsForm: FormGroup;

  constructor() {
    this.itemsForm = this.fb.group({
      items: this.fb.array([]),
    });

    this.detailsForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      dueDate: ['', Validators.required],
      invoiceFile: [null], // Optional
      subTotal: [{ value: 0, disabled: true }],
      taxAmount: [{ value: 0, disabled: true }],
      totalAmount: [{ value: 0, disabled: true }],
    });
  }

  get items(): FormArray {
    return this.itemsForm.get('items') as FormArray;
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
    
    // The backend now provides full context (Project, Supervisor, PO Metadata) in a single call
    this.materialService.getInvoicePrepData(this.projectId, this.poId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prep) => {
          this.prepData = prep;
          
          // Build one FormGroup per billable item
          if (prep.billableItems?.length) {
            const itemGroups = prep.billableItems.map(item => this.buildItemGroup(item));
            this.itemsForm.setControl('items', this.fb.array(itemGroups));
          }

          this.recalculateTotals();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.notificationService.error('Failed to load invoice preparation data');
          this.isLoading = false;
          console.error('Invoice Prep Error:', err);
        }
      });
  }

  // BUG 1 — Reactive auto-calculation in itemsForm initialization
  private buildItemGroup(item: any): FormGroup {
    const group = this.fb.group({
      materialId: [item.materialId],
      materialName: [item.materialName || 'Material Name Unavailable'],
      materialCode: [item.materialCode || ''], // BUG 2 — Added material code
      acceptedQuantity: [item.acceptedQuantity || 0, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      taxRate: [item.taxRate ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      totalItemCost: [{ value: 0, disabled: true }], // computed, not user-editable
    });

    // Subscribe to unitPrice, taxRate AND acceptedQuantity changes simultaneously
    combineLatest([
      group.get('unitPrice')!.valueChanges.pipe(startWith(group.get('unitPrice')!.value)),
      group.get('taxRate')!.valueChanges.pipe(startWith(group.get('taxRate')!.value)),
      group.get('acceptedQuantity')!.valueChanges.pipe(startWith(group.get('acceptedQuantity')!.value)),
    ])
    .pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    )
    .subscribe(([price, tax, qtyVal]) => {
      const qty = parseFloat(qtyVal) || 0;
      const unitPrice = parseFloat(price) || 0;
      const taxRate = parseFloat(tax) || 0;

      // Formula: total = qty × unitPrice × (1 + taxRate / 100)
      const subtotal = qty * unitPrice;
      const taxAmount = subtotal * (taxRate / 100);
      const totalCost = parseFloat((subtotal + taxAmount).toFixed(2));

      // Patch silently — emitEvent: false prevents infinite loop
      group.get('totalItemCost')!.setValue(totalCost, { emitEvent: false });

      // Trigger grand total recalculation
      this.recalculateTotals();

      // Trigger change detection manually
      this.cdr.markForCheck();
    });

    return group;
  }

  submitInvoice(): void {
    if (this.detailsForm.invalid || this.itemsForm.invalid || !this.prepData) return;

    this.isLoading = true;
    const createDto: CreateInvoiceDto = {
      invoiceNumber: this.detailsForm.value.invoiceNumber,
      poId: this.poId,
      vendorId: this.prepData.vendorId,
      currency: this.prepData.currency,
      dueDate: this.detailsForm.value.dueDate,
      items: this.items.value.map((item: any) => ({
        materialId: item.materialId,
        quantity: item.acceptedQuantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        totalItemCost: item.acceptedQuantity * item.unitPrice * (1 + item.taxRate / 100),
      })),
      attachments: [],
      subTotal: this.subTotal,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
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

  // BUG 1 — Recalculate grand total, subtotal, and tax from ALL rows
  recalculateTotals(): void {
    let subtotal = 0;
    let taxTotal = 0;

    this.items.controls.forEach(group => {
      const qty = group.get('acceptedQuantity')!.value ?? 0;
      const unitPrice = parseFloat(group.get('unitPrice')!.value) || 0;
      const taxRate = parseFloat(group.get('taxRate')!.value) || 0;

      const rowSubtotal = qty * unitPrice;
      const rowTax = rowSubtotal * (taxRate / 100);

      subtotal += rowSubtotal;
      taxTotal += rowTax;
    });

    // Update component-level properties
    this.subTotal = parseFloat(subtotal.toFixed(2));
    this.taxAmount = parseFloat(taxTotal.toFixed(2));
    this.totalAmount = parseFloat((subtotal + taxTotal).toFixed(2));

    // Sync into detailsForm so Step 2 financial fields also stay live
    this.detailsForm.patchValue({
      subTotal: this.subTotal,
      taxAmount: this.taxAmount,
      totalAmount: this.totalAmount,
    }, { emitEvent: false });

    this.cdr.markForCheck();
  }

  // BUG 1 — Trigger the native file picker
  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  // BUG 1 — Handle file selected via picker
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  // BUG 1 — Drag and drop support
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // BUG 1 — Validate and store the file
  private handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.notificationService.error('Only PDF files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('File exceeds 5MB limit');
      return;
    }
    this.uploadedFile = file;
    this.detailsForm.patchValue({ invoiceFile: file });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.location.back();
  }
}
