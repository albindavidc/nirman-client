import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Task } from '../../services/task.service';
import { GanttService } from '../../services/gantt.service';
// @ts-ignore
import { gantt } from 'dhtmlx-gantt';

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonToggleModule,
  ],
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GanttChartComponent
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() tasks: Task[] = [];
  @Input() dependencies: any[] = [];
  @Input() phases: any[] = []; // Receive phases list
  @Output() taskClick = new EventEmitter<Task>();

  @ViewChild('ganttContainer') ganttContainer!: ElementRef;

  private ganttService = inject(GanttService);

  currentViewMode: 'Day' | 'Week' | 'Month' = 'Week';

  ngAfterViewInit() {
    this.initGantt();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['tasks'] || changes['dependencies'] || changes['phases']) &&
      this.ganttContainer
    ) {
      this.refreshGantt();
    }
  }

  // ... (ngOnDestroy, zoom methods same as before)

  ngOnDestroy() {
    gantt.clearAll();
  }

  zoomIn() {
    gantt.ext.zoom.zoomIn();
  }

  zoomOut() {
    gantt.ext.zoom.zoomOut();
  }

  zoomToFit() {
    gantt.ext.zoom.setLevel('week');
  }

  changeViewMode(mode: string) {
    this.currentViewMode = mode as any;
    switch (mode) {
      case 'Day':
        gantt.ext.zoom.setLevel('day');
        break;
      case 'Week':
        gantt.ext.zoom.setLevel('week');
        break;
      case 'Month':
        gantt.ext.zoom.setLevel('month');
        break;
    }
  }

  fitToProject() {
    this.zoomToFit();
  }

  private initGantt() {
    if (!this.ganttContainer) return;

    // Config
    (gantt.config as any).date_format = '%Y-%m-%d %H:%i';
    (gantt.config as any).readonly = false; // Must be false for reordering
    (gantt.config as any).row_height = 60;
    (gantt.config as any).bar_height = 36;
    (gantt.config as any).smart_rendering = true;

    // Enable Reordering
    (gantt.config as any).order_branch = true;
    (gantt.config as any).order_branch_free = true;
    (gantt.config as any).sort = true;

    // Disable other edit features to keep it "Read Only" style but allow sorting
    (gantt.config as any).drag_move = false;
    (gantt.config as any).drag_resize = false;
    (gantt.config as any).drag_progress = false;
    (gantt.config as any).drag_links = false;
    (gantt.config as any).details_on_dblclick = false;

    // Columns config - Custom Template for Design
    (gantt.config as any).columns = [
      {
        name: 'text',
        label: 'Task Name',
        tree: true,
        width: 360,
        resize: true,
        template: (obj: any) => {
          return `
              <div class="gantt-cell-content">
                  <div class="drag-handle"><span class="material-icons">drag_indicator</span></div>
                  <div class="task-info">
                    <div class="task-name">${obj.text}</div>
                    <div class="task-meta">
                        <span class="phase-badge phase-${(obj.phaseName || 'default').replace(/\s+/g, '-').toLowerCase()}">${obj.phaseName || 'Phase'}</span>
                        <span class="dot">•</span>
                        <span class="duration">${obj.duration} days</span>
                    </div>
                  </div>
              </div>
            `;
        },
      },
    ];

    // Zoom Configuration
    const zoomConfig = {
      levels: [
        {
          name: 'day',
          scale_height: 60,
          min_column_width: 40,
          scales: [
            // Top Scale: Dates like "2025-05-01"
            {
              unit: 'week',
              step: 1,
              format: (date: Date) => {
                const dateToStr = gantt.date.date_to_str('%Y-%m-%d');
                return dateToStr(date);
              },
            },
            // Bottom Scale: Day numbers 1, 2, 3...
            { unit: 'day', step: 1, format: '%j' },
          ],
        },
        {
          name: 'week',
          scale_height: 60,
          min_column_width: 50,
          scales: [
            { unit: 'month', step: 1, format: '%F %Y' },
            { unit: 'week', step: 1, format: 'W %W' },
          ],
        },
      ],
    };

    gantt.ext.zoom.init(zoomConfig as any);
    gantt.ext.zoom.setLevel('day'); // Default to Day view as per image

    gantt.init(this.ganttContainer.nativeElement);

    // Event handling
    gantt.attachEvent('onTaskClick', (id, e) => {
      const task = gantt.getTask(id) as any;
      if (task && task['_task']) {
        this.taskClick.emit(task['_task']);
      }
      return true;
    });

    // Templates
    gantt.templates.task_text = (start: Date, end: Date, task: any) => {
      const progress = Math.round((task.progress || 0) * 100);
      return `${progress}% • ${task.duration} days`;
    };

    // Grid Indent Template (Optional customization if needed for the dots/drag handle)
    // For now relying on default tree behavior but refined CSS

    this.renderData();
  }

  private refreshGantt() {
    if (!(gantt.getState() as any).isInitialized) {
      return;
    }
    this.renderData();
  }

  private renderData() {
    if (!this.tasks.length) {
      gantt.clearAll();
      return;
    }

    // Create Phase Map
    const phaseMap = new Map<string, string>();
    if (this.phases) {
      this.phases.forEach((p) => phaseMap.set(p.id, p.name));
    }

    const dhtmlxData = this.ganttService.mapTasksToDhtmlx(
      this.tasks,
      this.dependencies,
      phaseMap,
    );
    gantt.clearAll();
    gantt.parse(dhtmlxData, 'json');
    this.applyCustomStyles();
  }
  private applyCustomStyles() {
    gantt.templates.task_class = (start, end, task) => {
      // Map status to CSS class
      switch (task['status']) {
        case 'Completed':
          return 'gantt-task-completed';
        case 'In Progress':
          return 'gantt-task-progress';
        case 'Delayed':
          return 'gantt-task-delayed';
        default:
          return 'gantt-task-pending';
      }
    };
    gantt.render();
  }
}
