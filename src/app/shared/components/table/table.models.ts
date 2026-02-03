export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  cell?: (row: T) => unknown;
  type?: 'text' | 'date' | 'currency' | 'template' | 'actions';
  templateRef?: string; // Key to match with the passed template
  sortable?: boolean;
}

export interface TableAction {
  action: string;
  row: unknown;
}

export interface PaginationConfig {
  pageSize: number;
  pageSizeOptions: number[];
  pageIndex: number;
  total: number;
}
