import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  TitleCasePipe,
  SlicePipe,
  AsyncPipe,
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
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../shared/components/table/table.models';
import { PageEvent } from '@angular/material/paginator';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    SlicePipe,
    AsyncPipe,
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
})
export class MemberListComponent implements OnInit {
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

  searchControl = new FormControl('');
  roleControl = new FormControl('');

  pageSize = 10;
  pageIndex = 0;

  constructor(private store: Store, private dialog: MatDialog) {
    this.totalMembers$ = this.store.select(MemberSelectors.selectMemberTotal);
    this.loading$ = this.store.select(MemberSelectors.selectMemberLoading);
    this.members$ = this.store.select(MemberSelectors.selectAllMembers);

    // Compute counts from the members list
    // Note: This relies on loaded members. If loading is paginated, this count only reflects current page?
    // The original code did this, so preserving behavior. Ideally counts should come from backend stats.
    this.workerCount$ = this.members$.pipe(
      map(
        (members: Member[]) => members.filter((m) => m.role === 'worker').length
      )
    );
    this.supervisorCount$ = this.members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.role === 'supervisor').length
      )
    );
    this.activeCount$ = this.members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.userStatus === 'active').length
      )
    );
  }

  ngOnInit(): void {
    this.loadMembers();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadMembers();
      });

    this.roleControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.loadMembers();
    });
  }

  loadMembers() {
    this.store.dispatch(
      MemberActions.loadMembers({
        page: this.pageIndex + 1,
        limit: this.pageSize,
        search: this.searchControl.value || '',
        role: this.roleControl.value || '',
      })
    );
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadMembers();
  }

  openAddModal() {
    const dialogRef = this.dialog.open(MemberAddEditModalComponent, {
      width: '600px',
      data: { mode: 'add' },
    });
  }

  openEditModal(member: Member) {
    const dialogRef = this.dialog.open(MemberAddEditModalComponent, {
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
}
