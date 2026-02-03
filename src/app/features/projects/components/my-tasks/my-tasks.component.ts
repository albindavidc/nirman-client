import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService, Task } from '../../services/task.service';
import { StartTaskModalComponent } from './modals/start-task-modal.component';
import { UpdateProgressModalComponent } from './modals/update-progress-modal.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.scss',
})
export class MyTasksComponent implements OnInit {
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
    const dialogRef = this.dialog.open(StartTaskModalComponent, {
      width: '500px',
      panelClass: 'custom-modal',
      data: { task },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Optimistic update or reload
        // Call API
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
