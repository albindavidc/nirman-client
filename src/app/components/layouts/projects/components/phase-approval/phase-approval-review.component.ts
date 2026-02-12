import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectPhaseService } from '../../services/project-phase.service';
import { ApprovePhaseModalComponent } from './approve-phase-modal.component';
import { RejectPhaseModalComponent } from './reject-phase-modal.component';

export interface MediaItem {
  type: string;
  url: string;
  name?: string;
  uploadedAt?: string;
  description?: string;
}

export interface PhaseForApproval {
  phase: {
    id: string;
    name: string;
    description: string | null;
    progress: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    actualStartDate: string | null;
    actualEndDate: string | null;
    status: string;
    sequence: number;
  };
  project: {
    id: string;
    name: string;
    budget: number | null;
    spent: number | null;
  };
  approvals: {
    id: string;
    approvalStatus: string;
    comments: string | null;
    approverName?: string;
    requesterName?: string;
    approvedAt: string | null;
    requestedAt?: string;
    media?: MediaItem[];
  }[];
  taskStats: {
    total: number;
    completed: number;
  };
}

@Component({
  selector: 'app-phase-approval-review',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
  ],
  templateUrl: './phase-approval-review.component.html',
  styleUrl: './phase-approval-review.component.scss',
})
export class PhaseApprovalReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly phaseService = inject(ProjectPhaseService);

  today = new Date();
  phaseData$!: Observable<PhaseForApproval>;

  ngOnInit(): void {
    this.phaseData$ = this.route.paramMap.pipe(
      map((params) => params.get('phaseId')),
      switchMap((phaseId) => {
        if (!phaseId) throw new Error('Phase ID not found');
        return this.phaseService.getPhaseForApproval(
          phaseId,
        ) as Observable<PhaseForApproval>;
      }),
    );
  }

  getStatusDisplay(data: PhaseForApproval): string {
    const latestApproval = data.approvals[0];
    if (!latestApproval) return 'Pending Review';
    return latestApproval.approvalStatus === 'approved'
      ? 'Approved'
      : latestApproval.approvalStatus === 'rejected'
        ? 'Rejected'
        : 'Pending';
  }

  getPlannedDays(data: PhaseForApproval): number {
    if (!data.phase.plannedStartDate || !data.phase.plannedEndDate) return 0;
    const start = new Date(data.phase.plannedStartDate).getTime();
    const end = new Date(data.phase.plannedEndDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  getActualDays(data: PhaseForApproval): number {
    if (!data.phase.actualStartDate || !data.phase.actualEndDate) return 0;
    const start = new Date(data.phase.actualStartDate).getTime();
    const end = new Date(data.phase.actualEndDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  getDaysDiff(data: PhaseForApproval): number {
    return this.getActualDays(data) - this.getPlannedDays(data);
  }

  isDelayed(data: PhaseForApproval): boolean {
    return this.getDaysDiff(data) > 0;
  }

  getVariance(data: PhaseForApproval): number {
    if (!data.project.budget) return 0;
    const diff = (data.project.budget || 0) - (data.project.spent || 0);
    return Math.abs(Math.round((diff / data.project.budget) * 100));
  }

  openApproveModal(data: PhaseForApproval) {
    const dialogRef = this.dialog.open(ApprovePhaseModalComponent, {
      width: '500px',
      data: { phaseId: data.phase.id, phaseName: data.phase.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Refresh data or navigate back
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  openRejectModal(data: PhaseForApproval) {
    const dialogRef = this.dialog.open(RejectPhaseModalComponent, {
      width: '500px',
      data: { phaseId: data.phase.id, phaseName: data.phase.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['../../'], { relativeTo: this.route });
      }
    });
  }

  getSubmittedBy(data: PhaseForApproval): string {
    const latest = data.approvals[0];
    return latest?.requesterName || 'Unknown';
  }

  getAllMedia(data: PhaseForApproval): MediaItem[] {
    return data.approvals.flatMap((a) => a.media || []);
  }

  getPhotos(data: PhaseForApproval): MediaItem[] {
    return this.getAllMedia(data).filter((m) => m.type === 'image');
  }

  getVideos(data: PhaseForApproval): MediaItem[] {
    return this.getAllMedia(data).filter((m) => m.type === 'video');
  }

  getDocuments(data: PhaseForApproval): MediaItem[] {
    return this.getAllMedia(data).filter(
      (m) => m.type !== 'image' && m.type !== 'video',
    );
  }
}
