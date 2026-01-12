import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [formControl]="searchControl"
        [placeholder]="placeholder"
      />
      <button
        *ngIf="searchControl.value"
        matSuffix
        mat-icon-button
        aria-label="Clear"
        (click)="clearSearch()"
        class="clear-btn"
      >
        <mat-icon>close</mat-icon>
      </button>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .search-field {
        width: 280px;
        font-size: 14px;
      }

      ::ng-deep .search-field .mat-mdc-text-field-wrapper {
        background-color: var(--md-sys-color-surface-container);
        border-radius: 12px !important;
        height: 44px;
      }

      ::ng-deep .search-field .mdc-notched-outline {
        display: none !important;
      }

      ::ng-deep .search-field .mat-mdc-form-field-flex {
        padding: 0 12px !important;
        height: 44px;
        align-items: center;
      }

      ::ng-deep .search-field .mat-mdc-form-field-infix {
        padding: 0 !important;
        min-height: unset;
        border: 0;
      }

      ::ng-deep .search-field .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      ::ng-deep .search-field mat-icon[matPrefix] {
        color: var(--md-sys-color-on-surface-variant);
        margin-right: 8px;
      }

      .clear-btn {
        width: 28px;
        height: 28px;
        line-height: 28px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    `,
  ],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() initialValue = '';
  @Input() debounceTimeMs = 300;

  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.initialValue) {
      this.searchControl.setValue(this.initialValue, { emitEvent: false });
    }

    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.search.emit(value || '');
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
