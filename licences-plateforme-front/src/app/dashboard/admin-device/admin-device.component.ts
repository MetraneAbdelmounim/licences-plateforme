import { Component } from '@angular/core';
import { Client } from '../../models/client';
import { Device } from '../../models/device';
import { Modal } from 'flowbite';
import { DeviceService } from '../../services/device.service';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../../services/client.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-device',
  standalone: false,
  templateUrl: './admin-device.component.html',
  styleUrl: './admin-device.component.css'
})
export class AdminDeviceComponent {

  // @ts-ignore
    clients: Array<Client>=new Array<Client>()
selectedClients: any[] = [];
  itemsPerPage: number = 20;
  page:number=1;
  // @ts-ignore
  type: string = "Create"

  // @ts-ignore
  devices: Array<Device>=new Array<Device>()
  // @ts-ignore
  saving: boolean = false;
  // @ts-ignore
  editDevice: Device;
  hiddenModal: boolean = true;
  // @ts-ignore
  deviceEdited: Device = null;
  
  idEditDevice: string=""
  // @ts-ignore
  selectedFile: File=null;

  filename ='Importer un fichier';
  // @ts-ignore
  fileUploaded: boolean;
 
  uploaded: boolean = false;
  term: string = "";
  spinnerSite: boolean=false;
  deletedDeviceId: string = "";
  deletedModal: Modal | null = null;
  crudModal : Modal | null = null;
  spinnerReload : boolean=false
  idDeviceReloaded :  String=""

  ngAfterViewInit(): void {
    const modalDEl = document.getElementById('delete-modal-device');
    const modalCrud = document.getElementById('crud-modal-device');
    if (modalDEl) {
      this.deletedModal = new Modal(modalDEl);

    }
    if (modalCrud) {
      this.crudModal = new Modal(modalCrud);

    }
  }

  constructor(private deviceService:DeviceService,private message:ToastrService,private clientService:ClientService) { }

  ngOnInit(): void {
     
    this.filename ='Importer un fichier';
    // @ts-ignore
    this.selectedFile=null
    this.uploaded=false
    this.spinnerSite=true
    

    // @ts-ignore
    this.clientService.getAllClients().subscribe((clients:Array<Client>)=>{
          this.spinnerSite=false
          this.clients=clients
      
          
        },err=>{
          this.spinnerSite=false
          this.message.error("Une erreur est survenue ! ")
        })

     // @ts-ignore
    this.deviceService.getAllDevices().subscribe((devices:Array<Device>)=>{
      this.spinnerSite=false
      this.devices=devices
    },err=>{
      this.spinnerSite=false
      this.message.error("Une erreur est survenue ! ")
    })
  }

  onAddDevice(f: NgForm, device: Device,devices:Array<Device>) {

    if (f.valid) {


      if (this.type !== "Edit") {
        this.saving = true 
        
        this.deviceService.addDevice(f.value).subscribe((res: any) => {
          this.saving = false
          this.message.success(res.message)
          this.crudModal?.hide()
          this.ngOnInit()
          f.resetForm()
          
        }, e => {
          this.saving = false
          this.crudModal?.hide()
          this.message.error(e.error )
        })
      } else {
        this.saving = true
        this.deviceService.updateDevice(this.idEditDevice, f.value).subscribe((res: any) => {
          this.saving = false
          this.message.success(res.message)
          this.crudModal?.hide()
          this.ngOnInit()
          
        }, e => {
          this.saving = false
          this.crudModal?.hide()
          this.message.error(e.error,)
        })
      }

    }
  }
  onFitchDevice(device:Device) {
     // @ts-ignore
    this.idEditDevice = device?._id
    console.log(this.idEditDevice);
    
    this.type = "Edit"
    this.editDevice = device
    console.log(this.deviceEdited);
    
    this.crudModal?.show()

  }


  openAddModal() {
    this.ngOnInit()
    // @ts-ignore
    this.editStock = null
    this.type = 'Create'
    this.hiddenModal = false
  }

  onCloseAddModal() {
    this.hiddenModal = true
  }

  ShowModale(_id: string, nom: string) {
    /*if (_id) {
      this.modal.confirm({
        nzTitle: 'Vous êtes sûr de supprimer ce site ?',
        nzContent: "' " + nom + " '",
        nzOkText: 'Yes',
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => this.deleteSite(_id),
        nzCancelText: 'No',
      });
    }*/
  }

  deleteDevice(_id: string) {
    if (_id) {
      this.deviceService.deleteDevice(_id).subscribe((res: any) => {
        this.message.success(res.message)
        this.ngOnInit()
      }, e => {
        this.message.error(e.error)
      })
    }
    ;
    
  }

  openDeletedModal(_id?: string) {
  if (!_id) return;
  this.deletedDeviceId = _id;
  this.deletedModal?.show();
}
  openCrudModal() {
    this.type="Create"
    this.crudModal?.show()
  }

  detectFile(event: any) {
    this.spinnerSite=true
    this.selectedFile = event.target.files[0] ;
    if (event.target.files && event.target.files.length > 0) {
      this.onUploadFile(event.target.files[0]);
      this.deviceService.addDeviceFromFile(this.selectedFile).subscribe((res: any) => {
        this.spinnerSite=false
        this.uploaded=false
        this.message.success(res.message)
        this.ngOnInit()
      }, e => {
        this.spinnerSite=false
        this.uploaded=false
        this.message.error(e.error)
      })
      this.filename = this.selectedFile.name;
    }
  }
  private onUploadFile(file: File) {

    this.fileUploaded=true;
  }
  onStartUpload() {
    this.uploaded = true
  }

  exportFile(){
    this.deviceService.exportAllDevices().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'devices.xlsx';
      a.click();
    },err=>{
      this.message.error("Une erreur est survenue ! ")
      
    });
  }
  


getClientName(device: Device): string {
  if (!device.client) return '';
  return typeof device.client === 'string' ? device.client : (device.client as Client).nom;
}
getClientId(device: Device): string {
  if (!device.client) return '';
  return typeof device.client === 'string' ? device.client : (device.client as Client)._id || '';
}
formatDateForInput(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().substring(0, 10); // YYYY-MM-DD
}


}
