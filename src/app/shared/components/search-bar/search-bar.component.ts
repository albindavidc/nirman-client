import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() initialValue = '';
  @Input() debounceTimeMs = 300;

  @Output() searchChange = new EventEmitter<string>();

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
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        this.searchChange.emit(value || '');
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
