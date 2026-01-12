import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

import { Project, ProjectStats, TeamMember } from '../../models/project.models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,

    DatePipe,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '400ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          '.stat-card, .project-card',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class ProjectListComponent {
  // Mock Stats Data
  stats: ProjectStats = {
    activeProjects: 24,
    activeProjectsChange: 12,
    completedTasks: 156,
    completedTasksChange: 8,
    totalWorkforce: 342,
    workforceChange: 6,
    currentlyActive: 280,
    totalBudget: 8200000,
    budgetChange: 15,
    budgetSpent: 5100000,
  };

  // Mock Projects Data
  projects: Project[] = [
    {
      id: '1',
      name: 'Downtown Plaza Construction',
      description:
        'Multi-story commercial building with retail spaces and office units in downtown district.',
      icon: 'apartment',
      status: 'active',
      progress: 65,
      startDate: '2024-01-15',
      dueDate: '2024-12-20',
      teamMembers: [
        { id: '1', name: 'John Doe', initials: 'JD' },
        { id: '2', name: 'Sarah Miller', initials: 'SM' },
        { id: '3', name: 'Robert King', initials: 'RK' },
        { id: '4', name: 'Emily Chen', initials: 'EC' },
        { id: '5', name: 'Mike Brown', initials: 'MB' },
        { id: '6', name: 'Lisa Wang', initials: 'LW' },
        { id: '7', name: 'Tom Davis', initials: 'TD' },
      ],
    },
    {
      id: '2',
      name: 'Riverside Residential Complex',
      description:
        'Luxury apartment complex with amenities including pool, gym, and community center.',
      icon: 'home',
      status: 'active',
      progress: 82,
      startDate: '2024-03-10',
      dueDate: '2025-02-28',
      teamMembers: [
        { id: '8', name: 'Alex Lee', initials: 'AL' },
        { id: '9', name: 'Beth Taylor', initials: 'BT' },
        { id: '10', name: 'Chris Adams', initials: 'CA' },
        { id: '11', name: 'Diana Ross', initials: 'DR' },
        { id: '12', name: 'Eric Wood', initials: 'EW' },
      ],
    },
    {
      id: '3',
      name: 'Highway Extension Project',
      description:
        '4-lane highway extension connecting major urban centers with improved infrastructure.',
      icon: 'directions_car',
      status: 'paused',
      progress: 45,
      startDate: '2023-11-05',
      dueDate: '2025-06-15',
      teamMembers: [
        { id: '13', name: 'Mark Phillips', initials: 'MK' },
        { id: '14', name: 'Patricia Lee', initials: 'PL' },
        { id: '15', name: 'Kevin Hart', initials: 'KH' },
        { id: '16', name: 'Nancy Drew', initials: 'ND' },
        { id: '17', name: 'Oscar Wilde', initials: 'OW' },
        { id: '18', name: 'Quinn Foster', initials: 'QF' },
        { id: '19', name: 'Rachel Green', initials: 'RG' },
        { id: '20', name: 'Steve Jobs', initials: 'SJ' },
        { id: '21', name: 'Tony Stark', initials: 'TS' },
      ],
    },
    {
      id: '4',
      name: 'Medical Center Expansion',
      description:
        'New wing addition to existing medical facility with state-of-the-art equipment.',
      icon: 'local_hospital',
      status: 'active',
      progress: 35,
      startDate: '2024-02-20',
      dueDate: '2024-11-30',
      teamMembers: [
        { id: '22', name: 'Hannah Scott', initials: 'HS' },
        { id: '23', name: 'George Lucas', initials: 'GL' },
        { id: '24', name: 'Clara Jones', initials: 'CJ' },
        { id: '25', name: 'Daniel Kim', initials: 'DK' },
        { id: '26', name: 'Eva Martinez', initials: 'EM' },
        { id: '27', name: 'Frank White', initials: 'FW' },
        { id: '28', name: 'Grace Hall', initials: 'GH' },
        { id: '29', name: 'Ian Black', initials: 'IB' },
      ],
    },
    {
      id: '5',
      name: 'Shopping Mall Development',
      description:
        'Modern shopping complex with entertainment zone and food court facilities.',
      icon: 'store',
      status: 'active',
      progress: 20,
      startDate: '2024-04-05',
      dueDate: '2025-04-15',
      teamMembers: [
        { id: '30', name: 'Victor Reed', initials: 'VR' },
        { id: '31', name: 'Diana Noble', initials: 'DN' },
        { id: '32', name: 'Jack Sparrow', initials: 'JS' },
        { id: '33', name: 'Kate Bishop', initials: 'KB' },
        { id: '34', name: 'Leo Messi', initials: 'LM' },
        { id: '35', name: 'Maria Garcia', initials: 'MG' },
        { id: '36', name: 'Nick Fury', initials: 'NF' },
        { id: '37', name: 'Olivia Pope', initials: 'OP' },
        { id: '38', name: 'Peter Parker', initials: 'PP' },
        { id: '39', name: 'Queen Bey', initials: 'QB' },
      ],
    },
  ];

  statCards = [
    {
      label: 'Active Projects',
      sublabel: 'Last month: 21',
      icon: 'folder_open',
      color: 'primary',
      getValue: () => this.stats.activeProjects,
      getChange: () => this.stats.activeProjectsChange,
    },
    {
      label: 'Completed Tasks',
      sublabel: 'This week',
      icon: 'check_circle',
      color: 'success',
      getValue: () => this.stats.completedTasks,
      getChange: () => this.stats.completedTasksChange,
    },
    {
      label: 'Total Workforce',
      sublabel: `Currently active: ${this.stats.currentlyActive}`,
      icon: 'groups',
      color: 'info',
      getValue: () => this.stats.totalWorkforce,
      getChange: () => this.stats.workforceChange,
    },
    {
      label: 'Total Budget',
      sublabel: `Spent: $${(this.stats.budgetSpent / 1000000).toFixed(
        1
      )}M (62%)`,
      icon: 'payments',
      color: 'warning',
      getValue: () => `$${(this.stats.totalBudget / 1000000).toFixed(1)}M`,
      getChange: () => this.stats.budgetChange,
    },
  ];

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'danger';
  }

  getVisibleMembers(members: TeamMember[]): TeamMember[] {
    return members.slice(0, 2);
  }

  getRemainingCount(members: TeamMember[]): number {
    return Math.max(0, members.length - 2);
  }

  openCreateProjectModal(): void {
    // TODO: Implement create project modal
    console.log('Create project modal');
  }

  openProjectDetails(project: Project): void {
    // TODO: Navigate to project details
    console.log('Open project:', project.id);
  }
}
