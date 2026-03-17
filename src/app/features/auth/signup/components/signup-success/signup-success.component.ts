import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-signup-success',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './signup-success.component.html',
  styleUrl: './signup-success.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(
          '600ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class SignupSuccessComponent {}
