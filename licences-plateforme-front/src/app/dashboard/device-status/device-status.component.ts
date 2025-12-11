import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-status',
  standalone: false,
  templateUrl: './device-status.component.html',
  styleUrls: ['./device-status.component.css']
})
export class DeviceStatusComponent implements OnInit {

  @Input() endDate!: Date;

  spinnerPing: boolean = false;
  status: 'valid' | 'soon' | 'expired' = 'valid';

  ngOnInit(): void {
    const now = new Date();
    const deviceEndDate = new Date(this.endDate);

    if (deviceEndDate < now) {
      this.status = 'expired';
    } else {
      // Check if less than 6 months to expire
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

      if (deviceEndDate <= sixMonthsFromNow) {
        this.status = 'soon';
      } else {
        this.status = 'valid';
      }
    }
  }

}