import { Component, OnInit, inject } from '@angular/core';
import {
  CommonModule,
  TitleCasePipe,
  AsyncPipe,
  UpperCasePipe,
} from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Member } from '../../models/member.model';
import * as MemberActions from '../../store/member.actions';
import * as MemberSelectors from '../../store/member.selectors';
import { MemberAddEditModalComponent } from '../member-add-edit-modal/member-add-edit-modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../../shared/components/table/table.models';
import { PageEvent } from '@angular/material/paginator';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SearchBarComponent } from '../../../../../shared/components/search-bar/search-bar.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    TableComponent,
    TitleCasePipe,
    AsyncPipe,
    UpperCasePipe,
    SearchBarComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(15px)' }),
            stagger('50ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' }),
              ),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class MemberListComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  columns: TableColumn[] = [
    { key: 'member', header: 'Member', type: 'template', sortable: true },
    { key: 'role', header: 'Role', type: 'template', sortable: true },
    { key: 'skills', header: 'Skills', type: 'template' },
    { key: 'email', header: 'Email', type: 'template', sortable: true },
    { key: 'phoneNumber', header: 'Phone', type: 'text' },
    { key: 'createdAt', header: 'Joined Date', type: 'date', sortable: true },
    { key: 'status', header: 'Status', type: 'template', sortable: true },
    { key: 'actions', header: 'Actions', type: 'template' },
  ];

  totalMembers$: Observable<number>;
  members$: Observable<Member[]>;
  loading$: Observable<boolean>;
  workerCount$: Observable<number>;
  supervisorCount$: Observable<number>;
  activeCount$: Observable<number>;

  // searchControl = new FormControl(''); // Removed in favor of SearchBar
  roleControl = new FormControl('');

  pageSize = 10;
  pageIndex = 0;
  searchTerm = '';

  constructor() {
    this.totalMembers$ = this.store.select(MemberSelectors.selectMemberTotal);
    this.loading$ = this.store.select(MemberSelectors.selectMemberLoading);
    this.members$ = this.store.select(MemberSelectors.selectAllMembers);

    // Compute counts from the members list
    // Note: This relies on loaded members. If loading is paginated, this count only reflects current page?
    // The original code did this, so preserving behavior. Ideally counts should come from backend stats.
    this.workerCount$ = this.members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.role === 'worker').length,
      ),
    );
    this.supervisorCount$ = this.members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.role === 'supervisor').length,
      ),
    );
    this.activeCount$ = this.members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.userStatus === 'active').length,
      ),
    );
  }

  ngOnInit(): void {
    this.loadMembers();

    this.roleControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.loadMembers();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.pageIndex = 0;
    this.loadMembers();
  }

  loadMembers() {
    this.store.dispatch(
      MemberActions.loadMembers({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchTerm || '',
        role: this.roleControl.value || '',
      }),
    );
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadMembers();
  }

  openAddModal() {
    this.dialog.open(MemberAddEditModalComponent, {
      width: '600px',
      data: { mode: 'add' },
    });
  }

  openEditModal(member: Member) {
    this.dialog.open(MemberAddEditModalComponent, {
      width: '600px',
      data: { mode: 'edit', member },
    });
  }

  blockMember(member: Member) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Block Member',
        message: `Are you sure you want to block ${member.firstName}?`,
        confirmButtonText: 'Block',
        confirmButtonColor: 'warn',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(MemberActions.blockMember({ id: member.id }));
      }
    });
  }

  unblockMember(member: Member) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Unblock Member',
        message: `Are you sure you want to unblock ${member.firstName}?`,
        confirmButtonText: 'Unblock',
        confirmButtonColor: 'primary',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(MemberActions.unblockMember({ id: member.id }));
      }
    });
  }

  getSkillsTooltip(skills: string[] | undefined): string {
    return skills ? skills.slice(2).join(', ') : '';
  }
}
