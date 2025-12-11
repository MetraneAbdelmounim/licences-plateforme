import { Component } from '@angular/core';
import { Client } from '../models/client';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // @ts-ignore
  private authListenerSub : Subscription;
  memberIsAuthenticated : boolean = false;
  // @ts-ignore
  memberConnected : any
  spinnerSite: boolean=false;
// @ts-ignore
  role:string
  clients : Array<Client> = []

}
