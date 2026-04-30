import { 
  Component, 
  inject, 
  OnInit, 
  OnDestroy, 
  AfterViewInit, 
  HostListener, 
  signal, 
  PLATFORM_ID 
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  
  // State Signals
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  
  // Stats Counters (Synced with design)
  stats = [
    { label: 'Active Projects', value: 500, current: 0, suffix: '+' },
    { label: 'Daily Users', value: 10, current: 0, suffix: 'k+' }, // Design says 10k+
    { label: 'Uptime', value: 99.9, current: 0, suffix: '%' },
    { label: 'Support', value: 24, current: 0, suffix: '/7' }
  ];

  private revealObserver!: IntersectionObserver;
  private counterObserver!: IntersectionObserver;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Design uses 20px threshold for navbar state
      this.isScrolled.set(window.scrollY > 20);
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initRevealObserver();
      this.initCounterObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.revealObserver) this.revealObserver.disconnect();
    if (this.counterObserver) this.counterObserver.disconnect();
  }

  private initRevealObserver(): void {
    // QUALITY PASS: Implementing the specific stagger delay logic from the provided design
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Calculate stagger delay based on sibling index in grids
            const parent = entry.target.parentElement;
            const isGridChild = parent && (
              parent.classList.contains('features-grid') || 
              parent.classList.contains('detail-grid') || 
              parent.classList.contains('testimonials-grid')
            );
            
            const delay = isGridChild 
              ? Array.from(parent.children).indexOf(entry.target) * 80 
              : 0;
              
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            
            this.revealObserver.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.12 
      }
    );

    document.querySelectorAll('.reveal').forEach((el) => this.revealObserver.observe(el));
  }

  private initCounterObserver(): void {
    this.counterObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.startCounters();
          this.counterObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.querySelector('.stats-strip');
    if (statsSection) this.counterObserver.observe(statsSection);
  }

  private startCounters(): void {
    this.stats.forEach((stat, index) => {
      this.animateValue(index, 0, stat.value, 1500);
    });
  }

  private animateValue(index: number, start: number, end: number, duration: number): void {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing: easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentVal = easedProgress * (end - start) + start;
      this.stats[index].current = end % 1 === 0 ? Math.floor(currentVal) : Number(currentVal.toFixed(1));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  scrollTo(elementId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(elementId);
      if (element) {
        // Offset for the fixed navbar (72px) + some breathing room
        const y = element.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/supervisor']);
  }
}
