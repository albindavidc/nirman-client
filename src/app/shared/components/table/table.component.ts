import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  CommonModule,
  UpperCasePipe,
  DatePipe,
  CurrencyPipe,
} from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableColumn } from './table.models';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    UpperCasePipe,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() total: number = 0;
  @Input() isLoading: boolean = false;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() columnTemplates: { [key: string]: TemplateRef<any> } = {};
  @Input() actionTemplate?: TemplateRef<any>;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() rowClick = new EventEmitter<any>();

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.dataSource.data = this.data;
    }
    if (changes['columns']) {
      this.displayedColumns = this.columns.map((col) => col.key);
    }
  }

  ngAfterViewInit() {
    // If we are doing server-side pagination, we might not want to bind paginator to datasource automatically
    // effectively, but for client-side functionality we do.
    // However, the requirement mentions 'total' input, implying server-side pagination is likely or at least supported.
    // If 'total' is provided, we assume server-side control.

    if (!this.total) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  onPage(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSort(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
