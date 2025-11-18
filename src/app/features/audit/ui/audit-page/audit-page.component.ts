import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';


import { AuditApi } from '../../data/audit.api';
import { AuditAction, AuditLog, Page } from '../../data/audit.models';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule
  ],
  templateUrl: './audit-page.component.html',
  styleUrls: ['./audit-page.component.css']
})
export class AuditPageComponent {

  private api = inject(AuditApi);
  private fb = inject(FormBuilder);

  displayedColumns = [
    'whenAt', 'userEmail', 'result', 'message'
  ];

  form = this.fb.nonNullable.group({
    user: [''],
    action: ['' as '' | AuditAction],
    from:  [null as Date | null],
    to:    [null as Date | null],
  });

  pageIndex = signal(0);
  pageSize  = signal(10);

  data = signal<AuditLog[]>([]);
  total = signal(0);
  loading = signal(false);

  actions = this.api.actions();

  constructor() {
    // carga inicial
    this.load();
  }

  load() {
    this.loading.set(true);
    const { user, action } = this.form.getRawValue();

    this.api.list({
      user: user?.trim() || undefined,
      action: action || undefined,
      page: this.pageIndex(),
      size: this.pageSize()
    }).subscribe({
      next: (page: Page<AuditLog>) => {
        this.data.set(page.content);
        this.total.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search() {
    this.pageIndex.set(0);
    this.load();
  }

  clear() {
    this.form.reset({ user: '', action: '', from: null, to: null });
    this.pageIndex.set(0);
    this.load();
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  exportPdf() {
    const { from, to } = this.form.getRawValue();
    const iso = (d: Date | null) => d ? new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString() : undefined;

    this.api.exportAuditPdf(iso(from), iso(to)).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${new Date().toISOString().replace(/[:]/g,'-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
