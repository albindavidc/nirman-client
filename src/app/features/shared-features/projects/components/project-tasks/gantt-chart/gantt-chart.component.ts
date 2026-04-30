import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  CreateTaskDto,
  Task,
  TaskService,
} from '../../../services/task.service';
import { TaskDependency, ProjectPhase } from '../../../models/project.models';

// Interface for internal Gantt Task (extending the service Task or mapping to it)
export interface GanttTask {
  id: string;
  name: string;
  phase: string;
  duration: number;
  startWeek: number;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  dependencies?: string[];
  progress?: number;
  color?: string;
  startDate?: string;
  endDate?: string;
  originalTask?: Task;
}

export interface GanttWeek {
  week: number;
  dateRange: string;
  displayDate: string;
}

export interface GanttDay {
  day: number;
  weekDay: string;
  month: string;
  year: number;
  isWeekStart: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-gantt-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GanttChartComponent implements OnInit, OnChanges {
  @Input() tasks: Task[] = [];
  @Input() dependencies: TaskDependency[] = [];
  @Input() phases: ProjectPhase[] = [];
  @Output() taskClick = new EventEmitter<GanttTask>();

  /**
   * Hide header action buttons (export/print) when false.
   * Useful for embedding the chart in contexts where those controls are not needed.
   */
  @Input() showExportPrint = true;

  @ViewChild('timelineRef') timelineRef!: ElementRef<HTMLDivElement>;

  // Internal state
  ganttTasks: GanttTask[] = [];
  filteredTasks: GanttTask[] = [];
  viewMode: 'weekly' | 'daily' = 'weekly';
  zoom = 1;
  searchQuery = '';
  showDependencies = true;

  // Dragging state
  isDragging = false;
  dragType: 'move' | 'resize-left' | 'resize-right' | 'progress' | null = null;
  draggedTaskId: string | null = null;
  private dragStartX = 0;
  private dragStartValue = 0;
  private dragFixedEnd = 0; // To store the fixed end week during resize-left

  // Selected/Hovered
  hoveredTaskId: string | null = null;
  selectedTaskId: string | null = null;

  // Modals state
  showEditTask = false;
  editingTask: Partial<GanttTask> = {};
  showAddTask = false;
  newTask: Partial<GanttTask> = {
    name: '',
    phase: 'Phase 1',
    duration: 7,
    status: 'pending',
    progress: 0,
    dependencies: [],
    color: '#3b82f6', // Default blue
  };

  showExportModal = false;
  exportFormat: 'pdf' | 'excel' | 'png' | 'csv' = 'pdf';
  exportDateRange: 'all' | 'current' | 'custom' = 'all';
  exportIncludeDependencies = true;
  exportIncludeProgress = true;
  exportIncludeCriticalPath = true;
  exportIncludeTaskDetails = true;

  showPrintModal = false;
  printOrientation: 'portrait' | 'landscape' = 'landscape';
  printPageSize: 'a4' | 'a3' | 'letter' = 'letter';
  printIncludeDependencies = true;
  printShowProgressBars = true;
  printIncludeHeader = true;
  printColorPrinting = false;

  manualWeeksAdded = 0;

  // Constants
  readonly colorOptions = [
    { value: '#10b981', label: 'Completed (Green)' },
    { value: '#facc15', label: 'In Progress (Yellow)' }, // Changed to facc15 (yellow-400) for better visibility than f59e0b (amber) if desired, but sticking to prompt request "yellow"
    { value: '#9ca3af', label: 'Pending (Grey)' },
    { value: '#fb923c', label: 'Delayed (Orange)' },
  ];

  // Icons for template

  // Calculated values
  totalWeeks = 12;
  weeks: GanttWeek[] = [];
  dailyViewData: GanttDay[] = [];
  allDays: GanttDay[] = [];
  totalDays = 0;
  totalDependencies = 0;
  criticalPathCount = 0;

  // Project Start Date (Should ideally come from project details)
  projectStartDate: Date;

  private dialog = inject(MatDialog);
  private taskService = inject(TaskService);

  constructor() {
    // Initialize to start of current week (Sunday)
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = today.getDate() - day; // adjust when day is sunday
    this.projectStartDate = new Date(today.setDate(diff));
    this.projectStartDate.setHours(0, 0, 0, 0);
  }

  ngOnInit() {
    this.processTasks();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] || changes['dependencies'] || changes['phases']) {
      this.processTasks();
    }
  }

  headerBtnClick() {
    // openAddTask wrapper for template if needed without args
    this.openAddTask();
  }

  processTasks() {
    // 1. Determine Project Start Date based on Earliest Task
    if (this.tasks && this.tasks.length > 0) {
      const startDates = this.tasks
        .map((t) =>
          t.plannedStartDate ? new Date(t.plannedStartDate).getTime() : null,
        )
        .filter((d) => d !== null && !isNaN(d)) as number[];

      if (startDates.length > 0) {
        const minDate = new Date(Math.min(...startDates));
        // Normalize to start of that week (Sunday)
        const day = minDate.getDay();
        const diff = minDate.getDate() - day;
        this.projectStartDate = new Date(minDate);
        this.projectStartDate.setDate(diff);
        this.projectStartDate.setHours(0, 0, 0, 0);
      } else {
        // Fallback to current week start
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day;
        this.projectStartDate = new Date(today.setDate(diff));
        this.projectStartDate.setHours(0, 0, 0, 0);
      }
    }

    // Convert input tasks to GanttTasks
    // This is a mapping placeholder - ideally we map your real backend data to this structure
    // allowing for the specific fields needed by this gantt chart
    this.ganttTasks = this.tasks.length
      ? this.mapTasks(this.tasks)
      : this.getInitialTasks();
    this.filterTasks();
    this.calculateMetrics();
  }

  // Helper to map backend tasks to GanttTasks
  mapTasks(tasks: Task[]): GanttTask[] {
    return tasks.map((t, index) => {
      // ... date logic ...
      const startDate = t.plannedStartDate
        ? new Date(t.plannedStartDate)
        : null;
      const endDate = t.plannedEndDate ? new Date(t.plannedEndDate) : null;
      const duration =
        startDate && endDate
          ? Math.max(
              1,
              Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
          : 1;

      return {
        id: t.id || `task-${index}`,
        name: t.name || 'Unnamed Task',
        phase: t.phaseId || 'Phase 1',
        duration,
        startWeek: this.calculateStartWeek(t.plannedStartDate ?? undefined),
        status: this.mapStatus(t.status || 'pending'),
        progress: t.progress || 0,
        color: t.color || this.getColorForStatus(t.status),
        startDate: t.plannedStartDate
          ? new Date(t.plannedStartDate).toISOString()
          : undefined,
        endDate: t.plannedEndDate
          ? new Date(t.plannedEndDate).toISOString()
          : undefined,
        dependencies: t.predecessors?.map((p) => p.predecessorTaskId) || [], // Map from backend
        originalTask: t,
      };
    });
  }

  // Dummy fallback removed
  getInitialTasks(): GanttTask[] {
    return [];
  }

  calculateStartWeek(dateStr?: Date | string): number {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const diffTime = date.getTime() - this.projectStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Return relative week offset, can be negative if task is in past, but ideally 0 or positive for current view
    return diffDays / 7;
  }

  mapStatus(status: string): GanttTask['status'] {
    const s = status.toLowerCase();
    if (s.includes('complet')) return 'completed';
    if (s.includes('progress')) return 'in-progress';
    if (s.includes('delay')) return 'delayed';
    return 'pending';
  }

  getColorForStatus(status?: string): string {
    const s = this.mapStatus(status || '');
    switch (s) {
      case 'completed':
        return '#10b981'; // Green
      case 'in-progress':
        return '#facc15'; // Yellow
      case 'delayed':
        return '#fb923c'; // Orange
      case 'pending':
      default:
        return '#9ca3af'; // Grey
    }
  }

  filterTasks() {
    if (!this.searchQuery) {
      this.filteredTasks = [...this.ganttTasks];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredTasks = this.ganttTasks.filter((t) =>
        t.name.toLowerCase().includes(q),
      );
    }
  }

  calculateMetrics() {
    // Total Weeks
    let maxWeek = 8;
    this.ganttTasks.forEach((t) => {
      const endWeek = t.startWeek + t.duration / 7;
      if (endWeek > maxWeek) maxWeek = Math.ceil(endWeek);
    });
    this.totalWeeks = Math.max(maxWeek + 2, 12) + this.manualWeeksAdded;

    // Generate Weeks
    this.weeks = [];
    const startDate = this.projectStartDate;
    for (let i = 0; i < this.totalWeeks; i++) {
      const ws = new Date(startDate);
      ws.setDate(startDate.getDate() + i * 7);
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);

      const sm = ws.toLocaleDateString('en-US', { month: 'short' });
      const em = we.toLocaleDateString('en-US', { month: 'short' });
      const range =
        sm === em
          ? `${sm} ${ws.getDate()}-${we.getDate()}`
          : `${sm} ${ws.getDate()}-${em} ${we.getDate()}`;

      this.weeks.push({
        week: i + 1,
        dateRange: range,
        displayDate: ws.toISOString().split('T')[0],
      });
    }

    // Generate Days
    this.allDays = [];
    this.totalDays = this.totalWeeks * 7;
    for (let i = 0; i < this.totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      this.allDays.push({
        day: d.getDate(),
        weekDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        isWeekStart: i % 7 === 0,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }

    // Create daily view buckets if needed (same as allDays for now)
    this.dailyViewData = [...this.allDays];

    // Stats
    this.totalDependencies = this.ganttTasks.reduce(
      (acc, t) => acc + (t.dependencies?.length || 0),
      0,
    );
    this.criticalPathCount = this.ganttTasks.filter(
      (t) =>
        t.status === 'delayed' || (t.dependencies && t.dependencies.length > 1),
    ).length;
  }

  /**
   * Calculates the total width of the chart container based on the number of units (weeks/days) and zoom.
   * This ensures the container expands to fit the content, fixing the issue where borders/headers are cut off.
   */
  getContainerWidth(): number {
    const sidebarWidth = 350; // Width of the task info column
    let contentWidth = 0;
    let cssMinWidth = 0;

    if (this.viewMode === 'daily') {
      // Daily mode: 50px min-width per day
      contentWidth = this.totalDays * 50 * this.zoom;
      cssMinWidth = this.totalDays * 50;
    } else {
      // Weekly mode: 100px min-width per week
      contentWidth = this.totalWeeks * 100 * this.zoom;
      cssMinWidth = this.totalWeeks * 100;
    }

    // The container must be at least as wide as the CSS min-width of the cells
    // to prevent borders from being cut off when zooming out
    const finalContentWidth = Math.max(contentWidth, cssMinWidth);

    // Ensure a minimum visual width (e.g. initial view)
    const minAppWidth = 1200 * this.zoom;

    return sidebarWidth + Math.max(finalContentWidth, minAppWidth);
  }

  // --- UI Helpers ---

  getStatusColor(status: GanttTask['status']): string {
    switch (status) {
      case 'completed':
        return 'from-green-600/30 to-green-500/30 border-green-500/40';
      case 'in-progress':
        return 'from-amber-600/30 to-yellow-500/30 border-amber-500/40';
      case 'pending':
        return 'from-gray-600/20 to-gray-500/20 border-gray-500/30';
      case 'delayed':
        return 'from-red-600/30 to-red-500/30 border-red-500/40';
      default:
        return 'from-blue-600/30 to-blue-500/30 border-blue-500/40';
    }
  }

  getTaskBarStyle(task: GanttTask) {
    if (this.viewMode === 'daily') {
      const dayWidth = (100 / this.totalDays) * this.zoom;
      const left = task.startWeek * 7 * dayWidth;
      const width = task.duration * dayWidth;
      return { left: `${left}%`, width: `${width}%` };
    } else {
      const weekWidth = (100 / this.totalWeeks) * this.zoom;
      const left = task.startWeek * weekWidth;
      const width = (task.duration / 7) * weekWidth;
      return { left: `${left}%`, width: `${width}%` };
    }
  }

  // --- Interactions ---

  handleZoomIn() {
    this.zoom = Math.min(this.zoom + 0.25, 3);
  }

  handleZoomOut() {
    this.zoom = Math.max(this.zoom - 0.25, 0.5);
  }

  handleZoomToFit() {
    this.zoom = 1;
  }

  setViewMode(mode: 'weekly' | 'daily') {
    this.viewMode = mode;
    this.zoom = mode === 'daily' ? 0.75 : 1;
    this.zoom = mode === 'daily' ? 0.75 : 1;
  }

  addWeek() {
    this.manualWeeksAdded++;
    this.calculateMetrics();
    // Optional: could scroll to end here if desired
    setTimeout(() => {
      if (this.timelineRef) {
        this.timelineRef.nativeElement.scrollTo({
          left: this.timelineRef.nativeElement.scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  // Dragging Implementation
  onMouseDown(
    e: MouseEvent,
    task: GanttTask,
    type: 'move' | 'resize-left' | 'resize-right' | 'progress',
  ) {
    e.stopPropagation();
    this.isDragging = true;
    this.dragType = type;
    this.draggedTaskId = task.id;
    this.dragStartX = e.clientX;

    if (type === 'move') {
      this.dragStartValue = task.startWeek;
    } else if (type === 'resize-left') {
      this.dragStartValue = task.startWeek;
      // Calculate the fixed end week (Right side anchor)
      this.dragFixedEnd = task.startWeek + task.duration / 7;
    } else if (type === 'resize-right') {
      this.dragStartValue = task.duration;
    } else if (type === 'progress') {
      this.dragStartValue = task.progress || 0;
    }

    // Attach window listeners
    window.addEventListener('mousemove', this.bindMouseMove);
    window.addEventListener('mouseup', this.bindMouseUp);
  }

  // Bound methods for event listeners to allow removal
  private bindMouseMove = (e: MouseEvent) => this.onMouseMove(e);
  private bindMouseUp = () => this.onMouseUp();

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || !this.draggedTaskId || !this.timelineRef) return;

    const taskIndex = this.ganttTasks.findIndex(
      (t) => t.id === this.draggedTaskId,
    );
    if (taskIndex === -1) return;
    const task = this.ganttTasks[taskIndex];

    const rect = this.timelineRef.nativeElement.getBoundingClientRect();
    const deltaX = e.clientX - this.dragStartX;
    const deltaWeeks =
      this.viewMode === 'daily'
        ? ((deltaX / rect.width) * (this.totalDays / this.zoom)) / 7
        : (deltaX / rect.width) * (this.totalWeeks / this.zoom);

    // Create a copy to mutate
    const updatedTask = { ...task };

    if (this.dragType === 'move') {
      // Snap to nearest day (1/7 of a week)
      const rawStart = this.dragStartValue + deltaWeeks;
      const snappedStart = Math.round(rawStart * 7) / 7;

      updatedTask.startWeek = Math.max(
        0,
        Math.min(this.totalWeeks, snappedStart),
      );
    } else if (this.dragType === 'resize-left') {
      // Snap start date to nearest day
      const rawStart = this.dragStartValue + deltaWeeks;
      const snappedStart = Math.round(rawStart * 7) / 7;
      const newStartWeek = Math.max(0, snappedStart);

      // Calculate new duration based on FIXED end date
      // this.dragFixedEnd was set in onMouseDown
      const newDuration = Math.max(1, (this.dragFixedEnd - newStartWeek) * 7);

      updatedTask.startWeek = newStartWeek;
      updatedTask.duration = Math.round(newDuration);
    } else if (this.dragType === 'resize-right') {
      // Snap duration to nearest day (integers)
      const newDuration = Math.max(1, this.dragStartValue + deltaWeeks * 7);
      updatedTask.duration = Math.round(newDuration);
    } else if (this.dragType === 'progress') {
      const style = this.getTaskBarStyle(task);
      const barWidthPx = (parseFloat(style.width) / 100) * rect.width;
      const progressDelta = (deltaX / barWidthPx) * 100;
      updatedTask.progress = Math.max(
        0,
        Math.min(100, this.dragStartValue + progressDelta),
      );
    }

    // Update in place (Angular will detect change if we use proper change detection)
    this.ganttTasks[taskIndex] = updatedTask;
    this.filterTasks(); // Re-trigger filter to update view
  }

  onMouseUp() {
    if (this.isDragging && this.draggedTaskId) {
      // Find the task that was updated
      const task = this.ganttTasks.find((t) => t.id === this.draggedTaskId);
      if (task && task.originalTask?.id) {
        // Calculate new dates based on startWeek and duration
        const newStart = new Date(this.projectStartDate);
        newStart.setDate(newStart.getDate() + Math.round(task.startWeek * 7));

        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + Math.round(task.duration));

        const payload: Partial<CreateTaskDto> & { progress?: number } = {};

        // If we moved or resized, update dates
        if (
          this.dragType === 'move' ||
          this.dragType === 'resize-left' ||
          this.dragType === 'resize-right'
        ) {
          payload.plannedStartDate = newStart.toISOString();

          // Also update local model strings to reflect immediately if needed by other parts
          task.startDate = payload.plannedStartDate;
          task.endDate = payload.plannedEndDate;
        }

        // If we changed progress
        if (this.dragType === 'progress') {
          payload.progress = Math.round(task.progress || 0);
        }

        // Call backend
        if (task.originalTask?.id) {
          this.taskService.updateTask(task.originalTask.id, payload).subscribe({
            next: (updated) => {
              console.log('Task updated via drag', updated);
            },
            error: (err) => console.error('Failed to update task drag', err),
          });
        }
      }
    }

    this.isDragging = false;
    this.dragType = null;
    this.draggedTaskId = null;
    window.removeEventListener('mousemove', this.bindMouseMove);
    window.removeEventListener('mouseup', this.bindMouseUp);
  }

  // --- CRUD/Modal Logic ---

  openAddTask(contextTask?: GanttTask) {
    if (this.isDragging) return;

    // Default phase
    let defaultPhase = this.phases.length > 0 ? this.phases[0].id : 'Phase 1';

    // Auto-fill phase from context
    if (contextTask) {
      defaultPhase = contextTask.phase;
    } else if (this.selectedTaskId) {
      const selected = this.ganttTasks.find(
        (t) => t.id === this.selectedTaskId,
      );
      if (selected) defaultPhase = selected.phase;
    }

    this.newTask = {
      name: '',
      phase: defaultPhase,
      duration: 7,
      status: 'pending',
      progress: 0,
      dependencies: [],
      color: '#3b82f6',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.showAddTask = true;
  }

  closeAddTask() {
    this.showAddTask = false;
    this.newTask = {};
  }

  openEditTask(task: GanttTask) {
    if (this.isDragging) return;
    this.editingTask = {
      ...task,
      dependencies: [...(task.dependencies || [])],
    };
    this.selectedTaskId = task.id;
    this.showEditTask = true;
  }

  closeEditTask() {
    this.showEditTask = false;
    this.editingTask = {};
    this.selectedTaskId = null;
  }

  saveTask() {
    if (!this.editingTask.id) return;
    const task = this.ganttTasks.find((t) => t.id === this.editingTask.id);
    if (!task || !task.originalTask) return;

    // Recalculate duration if dates changed (assuming editingTask has dates bound)
    let duration = this.editingTask.duration;
    if (this.editingTask.startDate && this.editingTask.endDate) {
      const start = new Date(this.editingTask.startDate);
      const end = new Date(this.editingTask.endDate);
      const diff = end.getTime() - start.getTime();
      duration = Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    // Auto-update color based on status
    const color = this.getColorForStatus(this.editingTask.status);

    const payload: Partial<CreateTaskDto> = {
      name: this.editingTask.name,
      status: this.editingTask.status,
      progress: Math.round(this.editingTask.progress || 0),
      color: color,
      notes: this.editingTask.originalTask?.notes || undefined,
      plannedStartDate: this.editingTask.startDate
        ? new Date(this.editingTask.startDate).toISOString()
        : undefined,
      plannedEndDate: this.editingTask.endDate
        ? new Date(this.editingTask.endDate).toISOString()
        : undefined,
    };

    if (this.editingTask.originalTask?.id) {
      this.taskService
        .updateTask(this.editingTask.originalTask.id, payload)
        .subscribe({
          next: (updated) => {
            const idx = this.ganttTasks.findIndex(
              (t) => t.id === this.editingTask.id,
            );
            if (idx !== -1) {
              this.ganttTasks[idx] = {
                ...this.ganttTasks[idx],
                ...this.editingTask,
                duration: duration || this.editingTask.duration || 1,
                color: updated.color || color,
              };
              this.filterTasks();
            }
            this.closeEditTask();
          },
          error: (err) => console.error('Failed to update task', err),
        });
    }
  }

  addTask() {
    if (!this.newTask.name) return;

    // We need a phaseId. If phases are passed, use first or selected.
    // For now assuming 'Phase 1' is just a string, but backend needs phaseId (Guid/ObjectId).
    // The newTask.phase currently holds a string name from the prompt's default.
    // If we have `this.phases` input, we should select a valid phase ID.
    // Let's assume for this "mock" or "demo" component that we might need to find a real phase ID or create one.
    // If `this.phases` is empty, this call might fail if backend requires valid ID.
    // But assuming the user context implies working with real data:
    const phaseId =
      this.phases.length > 0
        ? this.phases[0].id
        : this.newTask.phase || 'dummy-phase-id';

    // Calculate duration from dates

    const start = this.newTask.startDate
      ? new Date(this.newTask.startDate)
      : new Date();
    const end = this.newTask.endDate
      ? new Date(this.newTask.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const status = this.newTask.status || 'pending';
    const color = this.getColorForStatus(status);

    const payload: CreateTaskDto = {
      phaseId: phaseId,
      name: this.newTask.name || 'New Task',
      plannedStartDate: start.toISOString(),
      plannedEndDate: end.toISOString(),
      status: status,
      priority: 'Medium',
      color: color,
    };

    this.taskService.createTask(payload).subscribe({
      next: (created) => {
        // Reload or add to list
        // Ideally re-fetch or emit event.
        // For now, push to local
        const task: GanttTask = {
          id: created.id,
          name: created.name,
          phase: created.phaseId, // Name mapping needed?
          duration: this.newTask.duration || 7, // Recalc from dates
          startWeek: this.calculateStartWeek(
            created.plannedStartDate
              ? new Date(created.plannedStartDate)
              : undefined,
          ),
          status: 'pending',
          progress: 0,
          color: created.color || '#3b82f6',
          dependencies: [],
          startDate: created.plannedStartDate?.toString(),
          endDate: created.plannedEndDate?.toString(),
          originalTask: created,
        };
        this.ganttTasks.push(task);
        this.filterTasks();
        this.calculateMetrics();
        this.closeAddTask();
      },
      error: (err) => console.error('Failed to create task', err),
    });
  }

  // Dependency Management
  addDependency(depId: string) {
    if (!this.editingTask.dependencies) this.editingTask.dependencies = [];
    if (!this.editingTask.dependencies.includes(depId)) {
      this.editingTask.dependencies.push(depId);
    }
  }

  removeDependency(depId: string) {
    if (!this.editingTask.dependencies) return;
    this.editingTask.dependencies = this.editingTask.dependencies.filter(
      (d) => d !== depId,
    );
  }

  // Dependency Lines Rendering
  getDependencyPath(fromTask: GanttTask, toTaskId: string): string {
    const toTask = this.ganttTasks.find((t) => t.id === toTaskId);
    if (!toTask || !this.showDependencies) return '';

    const fromIndex = this.filteredTasks.findIndex((t) => t.id === fromTask.id);
    const toIndex = this.filteredTasks.findIndex((t) => t.id === toTaskId);

    if (fromIndex === -1 || toIndex === -1) return '';

    // We need pixel calc here; simplistic approx for SVG overlay
    // Ideally we'd use ElementRef lookups for each row, but we can approx with percentages if careful
    // or better, use pixel values derived from computed styles logic.

    const rowHeight = 60; // Fixed row height
    const startY = fromIndex * rowHeight + 30; // Center of from row
    const endY = toIndex * rowHeight + 30;

    // Calculate X positions
    const fromStyle = this.getTaskBarStyle(fromTask);
    const toStyle = this.getTaskBarStyle(toTask);
    const fromR = parseFloat(fromStyle.left) + parseFloat(fromStyle.width);
    const toL = parseFloat(toStyle.left);

    // This is Tricky in Angular template without direct DOM access to exact pixels
    // We will render SVG at full container size and use % for X, px for Y.
    // X needs to be converted to percentage string for the path command.

    return `M ${fromR}% ${startY} 
            L ${(fromR + toL) / 2}% ${startY} 
            L ${(fromR + toL) / 2}% ${endY} 
            L ${toL}% ${endY}`;
  }
}
