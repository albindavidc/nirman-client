//front-end/src/app/components/worker/components/worker-attendance/check-out-card/check-out-card.component.ts
import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-check-out-card',
  imports: [MatIcon],
  templateUrl: './check-out-card.component.html',
  styleUrl: './check-out-card.component.scss',
})
export class CheckOutCardComponent {
  /* Optional Input */
  readonly checkOutTime = input<string | null>(null);
  readonly hoursToday = input<number>(0);
  readonly canCheckOut = input<boolean>(false);
  readonly isLoading = input<boolean>(false);

  /* Optional Output */
  readonly checkOut = output<void>();
}
