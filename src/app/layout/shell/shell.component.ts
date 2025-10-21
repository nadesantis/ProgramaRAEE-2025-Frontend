import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // ⬅️ AÑADIR
import { AuthService } from '../../core/auth/auth.service';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { map } from 'rxjs';
import { HasRoleDirective } from '../../core/auth/hash-core.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../core/i18n/language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, 
    LayoutModule,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, HasRoleDirective, LanguageSwitcherComponent, TranslateModule
  ],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent {
  private bo = inject(BreakpointObserver);
  private auth = inject(AuthService);
  private router = inject(Router);

  username = this.auth.getUsername();
  roles = this.auth.getRoles();
  isHandset$ = this.bo.observe(Breakpoints.Handset).pipe(map(r => r.matches));

  hasRole(role: string) { return this.auth.hasRole(role); }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }


}
