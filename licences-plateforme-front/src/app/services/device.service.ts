import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUri;

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
 
  constructor(private http: HttpClient) { }

  // Get all devices
  getAllDevices() {
    return this.http.get(BACKEND_URL + 'devices');
  }

  // Get devices by client/project
  getDevicesByClient(idClient: string) {
    return this.http.get(BACKEND_URL + 'devices/clients/' + idClient);
  }

  // Add a new device
  addDevice(deviceData: any) {
    return this.http.post(BACKEND_URL + 'devices', deviceData);
  }

  // Add devices from file upload
  addDeviceFromFile(fileData: File) {
       // @ts-ignore
    let dataUpload = new FormData();
    dataUpload.append('file', fileData)
    return this.http.post(BACKEND_URL + 'devices/file', dataUpload);
  }

  // Update a device
  updateDevice(idDevice: string | undefined, deviceData: any) {
    return this.http.put(BACKEND_URL + 'devices/' + idDevice, deviceData);
  }

  // Delete a device
  deleteDevice(idDevice: string) {
    return this.http.delete(BACKEND_URL + 'devices/' + idDevice);
  }

  // Export all devices (downloads file)
  exportAllDevices() {
    return this.http.get(BACKEND_URL + 'devices/export', { responseType: 'blob' });
  }
   exportAllDevicesByClient(idClient: string) {
    return this.http.get(BACKEND_URL + 'devices/export/'+idClient, { responseType: 'blob' });
  }


}
