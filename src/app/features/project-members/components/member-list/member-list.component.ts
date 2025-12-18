import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip'; // Added this
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select'; // Added this for roles filter
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Member } from '../../models/member.model';
import * as MemberActions from '../../store/member.actions';
import * as MemberSelectors from '../../store/member.selectors';
import { MemberAddEditModalComponent } from '../member-add-edit-modal/member-add-edit-modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
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
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
})
export class MemberListComponent implements OnInit {
  displayedColumns: string[] = [
    'member',
    'role',
    'skills',
    'email',
    'phone',
    'assignedSince',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Member>([]);
  totalMembers$: Observable<number>;
  loading$: Observable<boolean>;
  workerCount$: Observable<number>;
  supervisorCount$: Observable<number>;
  activeCount$: Observable<number>;

  searchControl = new FormControl('');
  roleControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private store: Store, private dialog: MatDialog) {
    this.totalMembers$ = this.store.select(MemberSelectors.selectMemberTotal);
    this.loading$ = this.store.select(MemberSelectors.selectMemberLoading);

    // Compute counts from the members list
    const members$ = this.store.select(MemberSelectors.selectAllMembers);
    this.workerCount$ = members$.pipe(
      map(
        (members: Member[]) => members.filter((m) => m.role === 'worker').length
      )
    );
    this.supervisorCount$ = members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.role === 'supervisor').length
      )
    );
    this.activeCount$ = members$.pipe(
      map(
        (members: Member[]) =>
          members.filter((m) => m.userStatus === 'active').length
      )
    );
  }

  ngOnInit(): void {
    this.loadMembers();

    this.store.select(MemberSelectors.selectAllMembers).subscribe((members) => {
      this.dataSource.data = members;
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.paginator.pageIndex = 0;
        this.loadMembers();
      });

    this.roleControl.valueChanges.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadMembers();
    });
  }

  loadMembers() {
    this.store.dispatch(
      MemberActions.loadMembers({
        page: this.paginator ? this.paginator.pageIndex + 1 : 1,
        limit: this.paginator ? this.paginator.pageSize : 10,
        search: this.searchControl.value || '',
        role: this.roleControl.value || '',
      })
    );
  }

  onPageChange(event: any) {
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
    if (confirm(`Are you sure you want to block ${member.firstName}?`)) {
      this.store.dispatch(MemberActions.blockMember({ id: member.id }));
    }
  }

  unblockMember(member: Member) {
    this.store.dispatch(MemberActions.unblockMember({ id: member.id }));
  }
}
