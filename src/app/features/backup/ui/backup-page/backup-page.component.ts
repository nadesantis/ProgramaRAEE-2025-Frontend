// src/app/features/backup/ui/backup-page/backup-page.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackupApi } from '../../data/backup.api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-backup-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatProgressBarModule, MatSnackBarModule,
    MatDividerModule,FormsModule
  ],
  templateUrl: './backup-page.component.html',
  styleUrls: ['./backup-page.component.css']
})
export class BackupPageComponent {
  private api = inject(BackupApi);
  private sb = inject(MatSnackBar);

  loadingExport = signal(false);      // Excel
  loadingExportPdf = signal(false);   // 🔴 NUEVO estado para PDF
  loadingImport = signal(false);
  dryRun = signal(false);
  selectedName = signal<string | null>(null);

  // EXISTENTE (Excel)
  onExport() {
    if (this.loadingExport()) return;
    this.loadingExport.set(true);
    this.api.exportExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:]/g, '-');
        a.href = url;
        a.download = `backup-${ts}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.sb.open('Backup Excel exportado', 'OK', { duration: 2500 });
        this.loadingExport.set(false);
      },
      error: () => {
        this.sb.open('No se pudo exportar el backup Excel', 'OK', { duration: 3000 });
        this.loadingExport.set(false);
      }
    });
  }

  // 🔴 NUEVO (PDF SIN usuarios)
  onExportPdf() {
    if (this.loadingExportPdf()) return;
    this.loadingExportPdf.set(true);

    this.api.exportPdf({
      products: true,
      clients: true,
      orders: true,
      users: false,          // << SIN USUARIOS
      auditIncluded: false   // ponelo true si querés auditoría
      // auditFrom: '2025-09-01T00:00:00Z', // opcional
      // auditTo:   '2025-09-30T23:59:59Z', // opcional
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const ts = new Date().toISOString().replace(/[:]/g, '-');
        a.href = url;
        a.download = `backup-${ts}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.sb.open('Backup PDF exportado (sin usuarios)', 'OK', { duration: 2500 });
        this.loadingExportPdf.set(false);
      },
      error: () => {
        this.sb.open('No se pudo exportar el backup PDF', 'OK', { duration: 3000 });
        this.loadingExportPdf.set(false);
      }
    });
  }

  onPick(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedName.set(file ? file.name : null);
    if (!file) return;

    this.loadingImport.set(true);
    this.api.importExcel(file, this.dryRun()).subscribe({
      next: (res: any) => {
        const msg = this.dryRun()
          ? 'Validación OK (dry-run)'
          : 'Importación completada';
        this.sb.open(msg, 'OK', { duration: 3000 });
        console.info('Resultado import:', res);
        this.loadingImport.set(false);
        this.selectedName.set(null);
        input.value = '';
      },
      error: (e) => {
        this.sb.open('Fallo al importar. Revisa el archivo.', 'OK', { duration: 3500 });
        console.error(e);
        this.loadingImport.set(false);
      }
    });
  }
}
