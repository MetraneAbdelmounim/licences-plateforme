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
  numberValid = 0; // ✅ NEW
  // @ts-ignore
  constructor(private deviceService: DeviceService, private message: ToastrService, private clientService: ClientService, private route: ActivatedRoute) { }


  ngOnInit(): void {
    Chart.register(...registerables);

    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) return;

    this.spinnerSite = true;

    this.clientService.getclientByID(clientId).subscribe({
      // @ts-ignore
      next: client => this.client = client,
      error: () => this.message.error('Erreur chargement client')
    });

    this.deviceService.getDevicesByClient(clientId).subscribe({
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
    const canvas = document.getElementById('expirationPieChart') as HTMLCanvasElement;
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
  exportDevices(idClient: string, client: string) {
    this.deviceService.exportAllDevicesByClient(idClient).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devices_${client}.xlsx`;
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