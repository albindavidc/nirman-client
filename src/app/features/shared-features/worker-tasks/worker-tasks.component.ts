import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService, Task } from '../projects/services/task.service';
import { WorkerTaskModalComponent, WorkerTaskModalData } from './modals/worker-task-modal.component';
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
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  inProgressCount$: Observable<number>;
  completedCount$: Observable<number>;
  highPriorityCount$: Observable<number>;

  constructor() {
    this.inProgressCount$ = this.tasks$.pipe(
      map((tasks) => tasks.filter((t) => t.status === 'In Progress').length),
    );
    this.completedCount$ = this.tasks$.pipe(
      map((tasks) => tasks.filter((t) => t.status === 'Completed').length),
    );
    this.highPriorityCount$ = this.tasks$.pipe(
      map(
        (tasks) =>
          tasks.filter(
            (t) => t.priority === 'High' || t.priority === 'Critical',
          ).length,
      ),
    );
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getMyTasks().subscribe((tasks) => {
      this.tasksSubject.next(tasks);
    });
  }

  openStartModal(task: Task) {
    const data: WorkerTaskModalData = { mode: 'start', task };
    const dialogRef = this.dialog.open(WorkerTaskModalComponent, {
      width: '500px',
      panelClass: 'custom-modal',
      data,
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

  openUpdateModal(task: Task) {
    const data: WorkerTaskModalData = { mode: 'update', task };
    const dialogRef = this.dialog.open(WorkerTaskModalComponent, {
      width: '500px',
      panelClass: 'custom-modal',
      data,
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
