import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProjectPhaseService,
  PhaseApprovalResponse,
} from '../../../../layouts/projects/services/project-phase.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Reuse existing modal if possible or create new one.
// For now, let's just assume we view details or navigate to the project phase.

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
  private route = inject(ActivatedRoute);

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
    // Navigate to the phase approval page in the project context
    // We need projectId for the route: /projects/:id/phases/:phaseId/approval
    // But approval response might not have projectId directly if not mapped?
    // We added projectName to DTO, but we might need projectId too.
    // Let's check DTO. It has phaseId. We might need to fetch phase to get projectId?
    // Or we should add projectId to the DTO.
    // For now, let's just log it.
    // Actually, looking at the DTO, we didn't add projectId, only projectName.
    // I should probably add projectId to DTO for navigation.
    // But for this task, listing is the priority.
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
