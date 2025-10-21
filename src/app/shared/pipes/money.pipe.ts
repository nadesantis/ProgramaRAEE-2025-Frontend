import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'money', standalone: true, pure: true })
export class MoneyPipe implements PipeTransform {
  constructor() {}

  transform(
    value: number | string | null | undefined,
    currency: string = 'ARS',
    locale: string = 'es-AR'
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const n = typeof value === 'string' ? Number(value) : value;
    if (isNaN(n as number)) return String(value);
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n as number);
  }
}
