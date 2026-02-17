import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms 200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
})
export class PageLoaderComponent implements OnInit {
  @Input() pageName: string = 'Loading';
  @Input() progress: number = 0; // 0 for indeterminate, 1-100 for determinate

  particles: number[] = Array.from({ length: 12 }, (_, i) => i);

  ngOnInit(): void {
    // Simulate progress if it's 0 (indeterminate) just for visual effect in demo
    // In real app, this would be controlled by parent or router events
    if (this.progress === 0) {
      this.simulateProgress();
    }
  }

  private simulateProgress() {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 5;
      if (current > 100) {
        current = 0;
      }
      // Only update if we want to simulate determinate loading.
      // For now, let's keep it indeterminate via CSS class if progress is 0.
      // or we can animate it here:
      // this.progress = Math.min(current, 100);
    }, 200);
  }
}
