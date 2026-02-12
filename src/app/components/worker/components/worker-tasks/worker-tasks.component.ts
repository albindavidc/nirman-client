import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  TaskService,
  Task,
} from '../../../layouts/projects/services/task.service';
import { StartTaskModalComponent } from './modals/start-task-modal.component';
import { UpdateProgressModalComponent } from './modals/update-progress-modal.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-worker-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './worker-tasks.component.html',
  styleUrl: './worker-tasks.component.scss',
})
export class WorkerTasksComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  inProgressCount$: Observable<number> = this.tasks$.pipe(
    map((tasks) => tasks.filter((t) => t.status === 'In Progress').length),
  );

  completedCount$: Observable<number> = this.tasks$.pipe(
    map((tasks) => tasks.filter((t) => t.status === 'Completed').length),
  );

  highPriorityCount$: Observable<number> = this.tasks$.pipe(
    map(
      (tasks) =>
        tasks.filter((t) => t.priority === 'High' || t.priority === 'Critical')
          .length,
    ),
  );

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe((tasks) => {
      this.tasksSubject.next(tasks);
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getPriorityClass(priority: string): string {
    return priority.toLowerCase().replace(/\s+/g, '-');
  }

  openStartModal(task: Task): void {
    const dialogRef = this.dialog.open(StartTaskModalComponent, {
      width: '500px',
      panelClass: 'custom-modal',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService
          .updateTask(task.id, {
            status: 'In Progress',
            notes: result.notes,
            actualStartDate: new Date().toISOString(),
          })
          .subscribe(() => this.loadTasks());
      }
    });
  }

  openUpdateModal(task: Task): void {
    const dialogRef = this.dialog.open(UpdateProgressModalComponent, {
      width: '500px',
      panelClass: 'custom-modal',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService
          .updateTask(task.id, {
            status: result.status,
            progress: result.progress,
            notes: result.notes,
          })
          .subscribe(() => this.loadTasks());
      }
    });
  }
}
