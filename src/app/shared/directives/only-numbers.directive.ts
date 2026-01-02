import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]',
  standalone: true,
})
export class OnlyNumbersDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'End',
      'Home',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (
      allowedKeys.indexOf(event.key) !== -1 ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key)) ||
      (event.metaKey && ['a', 'c', 'v', 'x'].includes(event.key))
    ) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if (event.key < '0' || event.key > '9') {
      event.preventDefault();
    }
  }

  // Also handle paste events to strip non-numbers
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }
}
