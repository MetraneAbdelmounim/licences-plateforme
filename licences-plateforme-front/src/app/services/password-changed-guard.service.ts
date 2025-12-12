import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class PasswordChangedGuardService {

  constructor(private loginService: LoginService, private router: Router)  {}

  canActivate(): Observable<boolean | UrlTree> {

    return this.loginService.getPasswordChanged().pipe(
      map(isChanged => {
        if (!isChanged) {
          return this.router.parseUrl('dashbord/change-password');
        }
        return true;
      })
    );
  }
}