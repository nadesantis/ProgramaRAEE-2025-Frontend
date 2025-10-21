import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  cell?: (row: T) => string | number | null | undefined;
  width?: string;
}

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
    MatProgressSpinnerModule
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})


export class TableComponent<T extends Record<string, any>> implements OnChanges {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() loading = false;

  @Output() paginate = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() action = new EventEmitter<{ type: 'edit'|'delete'|'approve'; row: T }>();

  @Input() actions: Array<'edit'|'delete'|'approve'> = ['edit','delete','approve'];

  displayedColumns: string[] = [];

  ngOnChanges(_: SimpleChanges): void {
    this.displayedColumns = this.columns.map(c => c.key).concat('actions');
  }

  cellValue(col: TableColumn<T>, row: T): any {
    return col.cell ? col.cell(row) : row[col.key];
  }

  emitAction(type: 'edit'|'delete'|'approve', row: T) {
    this.action.emit({ type, row });
  }
}

