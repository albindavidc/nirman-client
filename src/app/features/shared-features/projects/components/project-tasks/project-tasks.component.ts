import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService, Task } from '../../services/task.service';
import {
  TaskModalComponent,
  TaskModalData,
} from './task-modal/task-modal.component';

@Component({
  selector: 'app-project-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './project-tasks.component.html',
  styleUrls: ['./project-tasks.component.scss'],
})
export class ProjectTasksComponent implements OnInit {
  @Input() phaseId = '';
  private route = inject(ActivatedRoute);

  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

  tasks: Task[] = [];
  displayedColumns: string[] = [
    'name',
    'status',
    'priority',
    'assignee',
    'dates',
    'progress',
    'actions',
  ];

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (params['phaseId']) {
        this.phaseId = params['phaseId'];
        this.loadTasks();
      } else if (this.phaseId) {
        this.loadTasks();
      } else {
        // Load all tasks if no phaseId
        this.loadAllTasks();
      }
    });
  }

  loadTasks() {
    this.taskService.getPhaseTasks(this.phaseId).subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  loadAllTasks() {
    // Assuming we have a method to get all tasks for the project
    // But we need projectId.
    // Let's get projectId from parent route.
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (projectId) {
      this.taskService.getProjectTasks(projectId).subscribe((tasks) => {
        this.tasks = tasks;
      });
    }
  }

  openCreateTaskModal() {
    const projectId = this.route.parent?.snapshot.paramMap.get('id');
    if (!projectId) return;

    const dialogRef = this.dialog.open(TaskModalComponent, {
      width: '600px',
      data: {
        mode: 'create',
        projectId: projectId,
        phaseId: this.phaseId,
      } as TaskModalData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary'; // Greenish usually
      case 'in progress':
        return 'accent'; // Blueish
      case 'delayed':
        return 'warn';
      default:
        return 'default';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'warn';
      case 'medium':
        return 'accent';
      case 'low':
        return 'primary'; // or default
      default:
        return 'default';
    }
  }
}
