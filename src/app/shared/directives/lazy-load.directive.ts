import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]', // Targeted at images
  standalone: true,
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string | undefined;
  private observer: IntersectionObserver | undefined;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.initObserver();
  }

  private initObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver support
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage();
          this.observer?.disconnect();
        }
      });
    });

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    if (this.appLazyLoad) {
      this.renderer.setAttribute(
        this.el.nativeElement,
        'src',
        this.appLazyLoad
      );
      // Add a nice fade-in effect via class if desired
      this.renderer.addClass(this.el.nativeElement, 'loaded');
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
