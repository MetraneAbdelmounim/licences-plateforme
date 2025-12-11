import { Component, OnDestroy, OnInit } from '@angular/core';

import { NzMessageService } from 'ng-zorro-antd/message';
import { config } from '../../Config/config';
import { Chart, ChartConfiguration, ChartItem, ChartType, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

import { Device } from '../models/device';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client';
import { DeviceService } from '../services/device.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // @ts-ignore
  devices: Array<Site> = new Array<Device>()
  itemsPerPage: number = 7;
  page: number = 1;
  // @ts-ignore
  term: string = ""

  // @ts-ignore
  client: Client = null
  spinnerSite: boolean = false;
  numberExpired: number = 0
  numberSoonExpire: number = 0
  // @ts-ignore
  constructor(private deviceService: DeviceService, private message: ToastrService, private clientService: ClientService, private route: ActivatedRoute) { }


  ngOnInit(): void {


    this.devices = new Array<Device>()
    this.spinnerSite = true
    const clientId = this.route.snapshot.paramMap.get('id');
    // @ts-ignore
    this.clientService.getclientByID(clientId).subscribe((client: Client) => {
      this.spinnerSite = false
      this.client = client
    }, err => {
      this.spinnerSite = false
      this.message.error("Une erreur est survenue ! ")
    })

    // @ts-ignore

    this.deviceService.getDevicesByClient(clientId).subscribe((devices: Array<Device>) => {
      // @ts-ignore

      this.devices = devices
      const now = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(now.getMonth() + config.SOON_TO_EXPIRED);

      this.numberExpired = devices.filter(device =>
        device.endDate && new Date(device.endDate) < now
      ).length;
      this.numberSoonExpire = devices.filter(device => {
        const end = device.endDate ? new Date(device.endDate) : null;
        
        return end &&
          end >= now &&                 // not expired
          end <= sixMonthsFromNow;      // within next 6 months
      }).length;
      this.spinnerSite = false
    }, err => {
      this.spinnerSite = false
      this.message.error("Une erreur est survenue ! ")
    })

  }


filterStatus: string = 'all'; // all | expired | soon | valid

isExpired(endDate: string | Date): boolean {
  const now = new Date();
  return new Date(endDate) < now;
}

isSoonToExpire(endDate: string | Date): boolean {
  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(now.getMonth() + config.SOON_TO_EXPIRED);

  const end = new Date(endDate);
  return end >= now && end <= sixMonthsLater;
}

isValid(endDate: string | Date): boolean {
  return !this.isExpired(endDate) && !this.isSoonToExpire(endDate);
}

filterDevices(devices: any[]) {
  if (this.filterStatus === 'expired') {
    return devices.filter(d => this.isExpired(d.endDate));
  }

  if (this.filterStatus === 'soon') {
    return devices.filter(d => this.isSoonToExpire(d.endDate));
  }

  if (this.filterStatus === 'valid') {
    return devices.filter(d => this.isValid(d.endDate));
  }

  return devices; // default: all
}
 exportDevices(idClient:string,client:string){
    this.deviceService.exportAllDevicesByClient(idClient).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devices_${client}.xlsx`;
      a.click();
    },err=>{
       this.message.error("Une erreur est survenue ! ")
      
    });
  }

}