import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PasswordChangedGuardService {

  constructor(private loginService: LoginService, private router: Router)  {}

  canActivate() {
    const changed = this.loginService.getPasswordChangerListener();

    if (!changed) {
      return this.router.navigateByUrl('dashbord/change-password')
    }

    return true;
  }
}