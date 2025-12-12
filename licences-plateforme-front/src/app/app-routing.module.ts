import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminMemberComponent } from './dashboard/admin-member/admin-member.component';
import { AdminClientComponent } from './dashboard/admin-client/admin-client.component';
import { AdminDeviceComponent } from './dashboard/admin-device/admin-device.component';
import { ChangePasswordComponent } from './dashboard/change-password/change-password.component';
import { AuthGuardService } from './services/auth-guard.service';
import { AdminGuardService } from './services/admin-guard.service';
import { PasswordChangedGuardService } from './services/password-changed-guard.service';



export const routes: Routes = [
  {path:'' ,component: LoginComponent},
  {path:'clients' ,component: ClientsComponent,canActivate:[PasswordChangedGuardService,AuthGuardService]},
  {path:'clients/:id/dashbord' ,component: DashboardComponent,canActivate:[PasswordChangedGuardService,AuthGuardService]},
   {path:'dashbord/members' ,component: AdminMemberComponent,canActivate:[PasswordChangedGuardService,AuthGuardService,AdminGuardService]},
   {path:'dashbord/clients' ,component: AdminClientComponent,canActivate:[PasswordChangedGuardService,AuthGuardService,AdminGuardService]},
   {path:'dashbord/devices' ,component: AdminDeviceComponent,canActivate:[PasswordChangedGuardService,AuthGuardService,AdminGuardService]},
   {path:'dashbord/change-password' ,component: ChangePasswordComponent,canActivate:[AuthGuardService]},
  {path:'**', redirectTo:'clients'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutes { }
