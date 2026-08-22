import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AiInsightsService } from '../../../services/ai-insights.service';

@Component({
  selector: 'app-procurement-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './procurement-assistant.component.html',
  styleUrls: ['./procurement-assistant.component.scss']
})
export class ProcurementAssistantComponent {
  private aiService = inject(AiInsightsService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  chatHistory = signal<{role: 'user' | 'ai', content: string}[]>([]);
  currentQuery = '';
  isLoading = signal(false);

  constructor() {
    // Auto-scroll when history changes
    effect(() => {
      this.chatHistory(); // track dependency
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  ask() {
    if (!this.currentQuery.trim() || this.isLoading()) return;
    
    const question = this.currentQuery.trim();
    this.chatHistory.update(h => [...h, { role: 'user', content: question }]);
    this.currentQuery = '';
    this.isLoading.set(true);

    this.aiService.askProcurementAssistant(question).subscribe({
      next: (res) => {
        this.chatHistory.update(h => [...h, { role: 'ai', content: res.answer }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.chatHistory.update(h => [...h, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        this.isLoading.set(false);
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
