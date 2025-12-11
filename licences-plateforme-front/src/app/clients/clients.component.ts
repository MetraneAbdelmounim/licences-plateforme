import { Component } from '@angular/core';
import { ClientService } from '../services/client.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from '../models/client';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent {
 constructor(private clientService:ClientService,private message:ToastrService,private route:ActivatedRoute,private router:Router) { }
 clients: Array<Client>=new Array<Client>();
  spinnerSite: boolean=false;
  ngOnInit(): void {


     // @ts-ignore
    this.clientService.getAllClients().subscribe((clients:Array<Client>)=>{
    
   
      
      this.spinnerSite=false
      this.clients=clients
    })
  }
   dahsbord(arg0: string) {

    this.router.navigate(['/clients', arg0, 'dashbord'])
    .then(()=>{
      window.location.reload()
    })

  }
    
}
