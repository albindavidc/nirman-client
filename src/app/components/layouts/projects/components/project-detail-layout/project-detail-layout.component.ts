import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import * as ProjectActions from '../../store/project.actions';
import * as ProjectSelectors from '../../store/project.selectors';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/project.models';

@Component({
  selector: 'app-project-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, MatIconModule],
  templateUrl: './project-detail-layout.component.html',
  styleUrl: './project-detail-layout.component.scss',
})
export class ProjectDetailLayoutComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  project$: Observable<Project | undefined> = this.store
    .select(ProjectSelectors.selectSelectedProject)
    .pipe(map((p) => p ?? undefined));

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.store.dispatch(ProjectActions.loadProject({ id: projectId }));
    }
  }
}
