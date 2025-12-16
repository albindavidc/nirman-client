import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="splash-container"
      [@fadeOut]="isLoading() ? 'visible' : 'hidden'"
      *ngIf="showSplash()"
    >
      <div class="glow-background"></div>
      <div class="glow-accent"></div>
      
      <div class="logo-wrapper" [@pulse]="'active'">
        <div class="logo-box">
          <img src="assets/logo.svg" alt="Nirman" class="logo" />
        </div>
      </div>
      
      <div class="brand-text" [@slideUp]="'active'">
        <h1>Nirman</h1>
        <p>Building Tomorrow</p>
      </div>
    </div>
  `,
  styleUrl: './splash-screen.component.scss',
  animations: [
    trigger('fadeOut', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0, pointerEvents: 'none' })),
      transition('visible => hidden', animate('500ms ease-out')),
    ]),
    trigger('pulse', [
      state('active', style({ transform: 'scale(1)' })),
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('800ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '600ms 300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class SplashScreenComponent implements OnInit {
  isLoading = signal(true);
  showSplash = signal(true);

  ngOnInit(): void {
    // Hide splash after minimum display time
    setTimeout(() => {
      this.isLoading.set(false);
      // Remove from DOM after fade out animation
      setTimeout(() => {
        this.showSplash.set(false);
      }, 500);
    }, 2000);
  }
}
