import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatIconModule, TranslateModule],
  template: `
    <mat-select [value]="current()" (selectionChange)="change($event.value)" class="lang-select">
      <mat-option value="es">🇦🇷 Español</mat-option>
      <mat-option value="en">🇺🇸 English</mat-option>
    </mat-select>
  `,
  styles: [`.lang-select{min-width:120px}`]
})
export class LanguageSwitcherComponent {
  private translate = inject(TranslateService);
  current = signal(this.translate.currentLang || 'es');

  change(lang: 'es'|'en') {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.current.set(lang);
  }
}
