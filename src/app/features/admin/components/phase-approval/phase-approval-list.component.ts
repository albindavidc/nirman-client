import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProjectPhaseService,
  PhaseApprovalResponse,
} from '../../../shared-features/projects/services/project-phase.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-phase-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    RouterModule,
    MatDialogModule,
  ],
  templateUrl: './phase-approval-list.component.html',
  styleUrls: ['./phase-approval-list.component.scss'],
})
export class PhaseApprovalListComponent implements OnInit {
  private projectPhaseService = inject(ProjectPhaseService);
  private router = inject(Router);

  approvals$: Observable<PhaseApprovalResponse[]> = of([]);
  displayedColumns: string[] = [
    'projectName',
    'phaseName',
    'requestedBy',
    'status',
    'requestedAt',
    'actions',
  ];

  ngOnInit(): void {
    this.approvals$ = this.projectPhaseService.getAllApprovals().pipe(
      catchError((err) => {
        console.error('Error fetching approvals', err);
        return of([]);
      }),
    );
  }

  viewDetails(approval: PhaseApprovalResponse): void {
    if (approval.projectId && approval.phaseId) {
      this.router.navigate([
        '/admin/projects',
        approval.projectId,
        'phases',
        approval.phaseId,
        'review',
      ]);
    } else {
      console.warn('Missing projectId or phaseId for navigation', approval);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}
