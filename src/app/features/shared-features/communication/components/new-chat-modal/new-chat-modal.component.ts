import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { VendorService } from '../../../../vendor/services/vendor.service';
import { WorkerService } from '../../../../shared-features/workers/services/worker.service';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';

export interface ChatPartner {
  id: string;
  userId: string;
  name: string;
  role: string;
  type: 'vendor' | 'worker' | 'supervisor';
  avatar: string;
}

@Component({
  selector: 'app-new-chat-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './new-chat-modal.component.html',
  styleUrl: './new-chat-modal.component.scss',
})
export class NewChatModalComponent {
  private readonly dialogRef = inject(MatDialogRef<NewChatModalComponent>);
  private readonly vendorService = inject(VendorService);
  private readonly workerService = inject(WorkerService);

  searchQuery = '';
  private searchSubject = new BehaviorSubject<string>('');
  
  isLoading = false;
  partners$: Observable<ChatPartner[]> = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((query) => {
      this.isLoading = true;
      
      const vendors$ = this.vendorService.getVendors({ status: 'approved', search: query, limit: 10 }).pipe(
        map(res => res.vendors.map(v => ({
          id: v.id,
          userId: v.userId,
          name: v.companyName,
          role: v.productsServices?.length ? v.productsServices[0] : 'Vendor',
          type: 'vendor' as const,
          avatar: v.companyName.charAt(0).toUpperCase()
        }))),
        catchError(() => of([]))
      );

      const workers$ = this.workerService.getWorkers(1, 10, undefined, query).pipe(
        map(res => res.data.map(w => ({
          id: w.id,
          userId: w.id, // In workers, id is often userId but verify if needed
          name: `${w.firstName} ${w.lastName}`,
          role: w.professionalTitle || w.role || 'Worker',
          type: 'worker' as const,
          avatar: w.firstName.charAt(0).toUpperCase()
        }))),
        catchError(() => of([]))
      );

      return forkJoin([vendors$, workers$]).pipe(
        map(([vendors, workers]) => {
          this.isLoading = false;
          return [...vendors, ...workers];
        })
      );
    })
  );

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  selectPartner(partner: ChatPartner) {
    this.dialogRef.close(partner);
  }

  close() {
    this.dialogRef.close(null);
  }
}
