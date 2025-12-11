import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DeviceService } from '../services/device.service';
import { Device } from '../models/device';

@Component({
  selector: 'app-total-componant',
  standalone: false,
  templateUrl: './total-componant.component.html',
  styleUrl: './total-componant.component.css',

})
export class TotalComponantComponent implements OnInit {

  @Input()
  type:string=""
@Input()
  idClient!:string 
  total : number=0
  constructor(private deviceService:DeviceService ){}
  ngOnInit(): void {

   
      // @ts-ignore
      this.deviceService.getDevicesByClient(this.idClient).subscribe((devices : Array<Device>)=>{
  
        
        this.total=devices?.length
 
        
      })


  
  }



}