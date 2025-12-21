import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { routes } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { ClientsComponent } from './clients/clients.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AsideComponent } from './dashboard/aside/aside.component';
import { DeviceStatusComponent } from './dashboard/device-status/device-status.component';
import {NgxPaginationModule} from "ngx-pagination";
import { NgArrayPipesModule } from 'ngx-pipes';
import { TotalComponantComponent } from './total-componant/total-componant.component';
import { AdminMemberComponent } from './dashboard/admin-member/admin-member.component';
import { AdminClientComponent } from './dashboard/admin-client/admin-client.component';
import { AdminDeviceComponent } from './dashboard/admin-device/admin-device.component';
import { ChangePasswordComponent } from './dashboard/change-password/change-password.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { GlobalVueComponent } from './global-vue/global-vue.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    ClientsComponent,
    DashboardComponent,
    AsideComponent,
    DeviceStatusComponent,
    TotalComponantComponent,
    AdminMemberComponent,
    AdminClientComponent,
    AdminDeviceComponent,
    ChangePasswordComponent,
    GlobalVueComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      positionClass :'toast-bottom-right'
    }),
    RouterModule.forRoot(routes, { useHash: true }),

   CommonModule,
   NgxPaginationModule,
   NgArrayPipesModule,
   HttpClientModule,
  ],
  providers: [provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
