import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-check-in-out-card',
  imports: [CommonModule, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './check-in-out-card.component.html',
  styleUrl: './check-in-out-card.component.scss',
})
export class CheckInOutCardComponent {
  /* Required Inputs */
  readonly date = input.required<string>();
  readonly time = input.required<string>();

  /* Check-Out Time Input */
  readonly checkOutTime = input<string | null>(null);

  get timeVal(): string {
    return this.time().replace(/\s+(AM|PM)/i, '');
  }

  get timePeriod(): string {
    const match = this.time().match(/\s+(AM|PM)/i);
    return match ? match[1] : '';
  }

  get checkOutTimeVal(): string {
    const t = this.checkOutTime();
    return t ? t.replace(/\s+(AM|PM)/i, '') : '-- : --';
  }

  get checkOutTimePeriod(): string {
    const t = this.checkOutTime();
    if (!t) return '';
    const match = t.match(/\s+(AM|PM)/i);
    return match ? match[1] : '';
  }

  /* Optional Inputs */
  readonly location = input<string>();
  readonly formattedHoursToday = input<string>('0h 0m');
  readonly isCheckingIn = input<boolean>(false);
  readonly isCheckingOut = input<boolean>(false);
  readonly checkedIn = input<boolean>(false);
  readonly canCheckOut = input<boolean>(false);

  /* Optional Outputs */
  readonly checkIn = output<void>();
  readonly checkOut = output<void>();
}
