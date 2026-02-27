// front-end/src/app/components/worker/components/worker-attendance/check-in-card/check-in-card.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-check-in-card',
  imports: [CommonModule, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './check-in-card.component.html',
  styleUrl: './check-in-card.component.scss',
})
export class CheckInCardComponent {
  /* Required Inputs */
  readonly date = input.required<string>();
  readonly time = input.required<string>();

  /* Optional Inputs */
  readonly location = input<string>();
  readonly isLoading = input<boolean>(false);
  readonly checkedIn = input<boolean>(false);

  /* Optional Outputs */
  readonly checkIn = output<void>();
}
