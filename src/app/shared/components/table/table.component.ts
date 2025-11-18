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

/** Claves soportadas por la tabla */
export type TableActionKey = 'view' | 'approve' | 'edit' | 'delete' | 'pwd' | 'unlock';

/** Config opcional por acción (si no pasás objeto, la tabla autocompleta por defecto) */
export type TableAction<T = any> = {
  key: TableActionKey;
  icon?: string;
  tooltip?: string;
  color?: string; // 'primary' | 'accent' | 'warn' | ...
  visible?: (row: T) => boolean; // si devuelve false, se oculta para esa fila
};

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

  /** Ahora acepta claves o objetos */
  @Input() actions: Array<TableAction<T> | TableActionKey> = [];

  @Output() paginate = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  /** Emitimos la *key* (no el objeto), para que fuera fácil de usar en los padres */
  @Output() action = new EventEmitter<{ type: TableActionKey; row: T }>();

  displayedColumns: string[] = [];

  private defaultIcons: Record<TableActionKey, string> = {
    view: 'visibility',
    approve: 'check_circle',
    edit: 'edit',
    delete: 'delete',
    pwd: 'lock_reset',
    unlock: 'lock_open',
  };

  ngOnChanges(_: SimpleChanges): void {
    this.displayedColumns = this.columns.map(c => c.key);
    if (this.actions && this.actions.length) this.displayedColumns.push('actions');
  }

  cellValue(col: TableColumn<T>, row: T): any {
    return col.cell ? col.cell(row) : row[col.key];
  }

  /** Normaliza una acción: si viene solo la key, completa icono/tooltip por defecto */
  private toAction(a: TableAction<T> | TableActionKey): TableAction<T> {
    if (typeof a === 'string') {
      const k = a as TableActionKey;
      return {
        key: k,
        icon: this.defaultIcons[k],
        tooltip: this.labelFor(k),
      };
    }
    return {
      icon: this.defaultIcons[a.key],
      tooltip: a.tooltip ?? this.labelFor(a.key),
      ...a,
    };
  }

  /** Lista de acciones visibles para una fila */
  getActionsFor(row: T): TableAction<T>[] {
    return (this.actions ?? [])
      .map(a => this.toAction(a))
      .filter(a => !a.visible || a.visible(row));
  }

  emitAction(type: TableActionKey, row: T) {
    this.action.emit({ type, row });
  }

  private labelFor(k: TableActionKey): string {
    switch (k) {
      case 'view': return 'Ver';
      case 'approve': return 'Aprobar';
      case 'edit': return 'Editar';
      case 'delete': return 'Eliminar';
      case 'pwd': return 'Resetear contraseña';
      case 'unlock': return 'Desbloquear';
    }
  }
}
