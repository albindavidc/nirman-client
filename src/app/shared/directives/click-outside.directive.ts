import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  private elementRef = inject(ElementRef);

  @Output() appClickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event.target'])
  public onClick(eventTarget: EventTarget | null) {
    const target = eventTarget as Node;
    if (!target) return;
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
