import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  @Input('appHasRole') set setRole(roleOrRoles: string | string[]) {
    const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    const ok = roles.some(r => this.auth.hasRole(r));
    this.vcr.clear();
    if (ok) this.vcr.createEmbeddedView(this.tpl);
  }
}
