import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type Lang = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly supported: readonly Lang[] = ['es', 'en'];
  readonly defaultLang: Lang = 'es';

  current = signal<Lang>(
    (localStorage.getItem('lang') as Lang) ?? this.defaultLang
  );

  constructor(private t: TranslateService) {}


  init(): void {

    this.t.addLangs(this.supported as unknown as string[]);
    this.t.setDefaultLang(this.defaultLang);

    const stored = localStorage.getItem('lang') as Lang | null;
    const detected = this.detectBrowserLang();

    const lang: Lang =
      (stored && this.supported.includes(stored)) ? stored :
      (detected ?? this.defaultLang);

    this.apply(lang);
  }

  set(lang: Lang): void {
    if (!this.supported.includes(lang)) return;
    this.apply(lang);
    localStorage.setItem('lang', lang);
  }

  private apply(lang: Lang): void {
    this.current.set(lang);
    this.t.use(lang);
    document.documentElement.lang = lang;
  }


  private detectBrowserLang(): Lang | null {
    const pick = (v?: string) => {
      const two = v?.slice(0, 2) as Lang | undefined;
      return (two === 'es' || two === 'en') ? two : null;
    };
    return (
      pick(navigator.language) ||
      navigator.languages?.map(l => pick(l)).find(Boolean) ||
      null
    );
  }
}
