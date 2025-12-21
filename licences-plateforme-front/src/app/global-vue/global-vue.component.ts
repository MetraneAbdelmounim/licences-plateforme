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
  selector: 'app-global-vue',
  standalone: false,
  templateUrl: './global-vue.component.html',
  styleUrl: './global-vue.component.css'
})
export class GlobalVueComponent {
  // @ts-ignore
  devices: Array<Site> = new Array<Device>()
  itemsPerPage: number = 7;
  page: number = 1;
  // @ts-ignore
  term: string = ""

  // @ts-ignore
  clients: Array<Client> = null
  spinnerSite: boolean = false;
  numberExpired: number = 0
  numberSoonExpire: number = 0
  numberValid = 0; // ✅ NEW
  // @ts-ignore
  constructor(private deviceService: DeviceService, private message: ToastrService, private clientService: ClientService, private route: ActivatedRoute) { }


  ngOnInit(): void {
    Chart.register(...registerables);


    this.spinnerSite = true;
    // @ts-ignore
    this.clientService.getAllClients().subscribe((clients:Array<Client>)=>{
      this.clients=clients
    })
    

    this.deviceService.getAllDevices().subscribe({
      next: devices => {
        // @ts-ignore
        this.devices = devices;
        // @ts-ignore
        this.calculateStats(devices);
        this.spinnerSite = false;

        setTimeout(() => this.createExpirationPieChart(), 0);
      },
      error: () => {
        this.spinnerSite = false;
        this.message.error('Erreur chargement devices');
      }
    });

  }
  calculateStats(devices: Device[]) {
    const now = new Date();
    const limit = new Date();
    limit.setMonth(now.getMonth() + config.SOON_TO_EXPIRED);

    this.numberExpired = 0;
    this.numberSoonExpire = 0;
    this.numberValid = 0;

    devices.forEach(device => {
      if (!device.endDate) return;

      const end = new Date(device.endDate);

      if (end < now) {
        this.numberExpired++;
      } else if (end <= limit) {
        this.numberSoonExpire++;
      } else {
        this.numberValid++; // ✅ VALID
      }
    });
  }

  createExpirationPieChart() {
    const canvas = document.getElementById('expirationPieChart_global') as HTMLCanvasElement;
    if (!canvas) return;

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Valid', 'Soon to expire', 'Expired'],
        datasets: [{
          data: [
            this.numberValid,
            this.numberSoonExpire,
            this.numberExpired
          ],
          backgroundColor: [
            '#9fd5b3ff', // green
            '#efdf9dff', // yellow
            '#f48f8fff'  // red
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
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
  exportDevices() {
    this.deviceService.exportAllDevices().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devices.xlsx`;
      a.click();
    }, err => {
      this.message.error("Une erreur est survenue ! ")

    });
  }
  onRefresh() {
    this.ngOnInit()
    window.location.reload()
  }
}
