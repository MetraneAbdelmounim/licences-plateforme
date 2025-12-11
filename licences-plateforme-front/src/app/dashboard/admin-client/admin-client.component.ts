import { Component } from '@angular/core';
import { Client } from '../../models/client';
import { Modal } from 'flowbite';
import { ClientService } from '../../services/client.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-client',
  standalone: false,
  templateUrl: './admin-client.component.html',
  styleUrl: './admin-client.component.css'
})
export class AdminClientComponent {
  itemsPerPage: number = 20;
  page: number = 1;
  // @ts-ignore
  type: string = "Create";

  // @ts-ignore
  clients: Array<Client> = new Array<Client>();
  // @ts-ignore
  saving: boolean = false;
  // @ts-ignore
  editClient: Client;
  hiddenModal: boolean = true;
  // @ts-ignore
  clientEdited: Client = null;
  // @ts-ignore
  idEditClient: string;
  // @ts-ignore
  selectedFile: File = null;

  filename = 'Importer un fichier';
  // @ts-ignore
  fileUploaded: boolean;
  uploaded: boolean = false;
  term: string = "";
  spinnerClient: boolean = false;
  deletedClientId: string = "";
  deletedModal: Modal | null = null;
  crudModal: Modal | null = null;

  ngAfterViewInit(): void {
    const modalDel = document.getElementById('delete-modal-client');
    const modalCrud = document.getElementById('crud-modal-client');
    if (modalDel) {
      this.deletedModal = new Modal(modalDel);
    }
    if (modalCrud) {
      this.crudModal = new Modal(modalCrud);
    }
  }

  constructor(private clientService: ClientService, private message: ToastrService) { }

  ngOnInit(): void {
    this.spinnerClient = true;
    this.onCloseAddModal();
    //@ts-ignore
    this.clientService.getAllClients().subscribe((clients: Array<Client>) => {
      this.spinnerClient = false;
      this.clients = clients;
    }, err => {
      this.spinnerClient = false;
      this.message.error("Une erreur est survenue !");
    });
  }

  onAddClient(f: NgForm, client: Client) {
    if (f.valid) {
      if (this.type !== "Edit") {
        this.saving = true;
        this.clientService.addClient(f.value).subscribe((res: any) => {
          this.saving = false;
          this.message.success(res.message);
          this.crudModal?.hide();
          this.ngOnInit();
          f.resetForm();
        }, e => {
          this.saving = false;
          this.crudModal?.hide();
          this.message.error(e.error);
        });
      } else {
        this.saving = true;
        this.clientService.editClient(this.idEditClient, f.value).subscribe((res: any) => {
          this.saving = false;
          this.message.success(res.message);
          this.crudModal?.hide();
          this.ngOnInit();
        }, e => {
          this.saving = false;
          this.crudModal?.hide();
          this.message.error(e.error);
        });
      }
    }
  }

  onFitchClient(client: Client) {
    this.idEditClient = client?._id;
    this.type = "Edit";
    this.clientEdited = client;
    this.crudModal?.show();
  }

  openAddModal() {
    this.ngOnInit();
    // @ts-ignore
    this.editClient = null;
    this.type = 'Create';
    this.hiddenModal = false;
  }

  onCloseAddModal() {
    this.hiddenModal = true;
  }

  deleteClient(_id: string) {
    if (_id) {
      this.clientService.deleteClient(_id).subscribe((res: any) => {
        this.message.success(res.message);
        this.onCloseAddModal();
        this.ngOnInit();
      }, e => {
        this.message.error(e.error);
      });
    }
  }

  openDeletedModal(arg0: string) {
    this.deletedClientId = arg0;
    this.deletedModal?.show();
  }

  openCrudModal() {
    this.type = "Create";
    this.crudModal?.show();
  }

  private onUploadFile(file: File) {
    this.fileUploaded = true;
  }

  onStartUpload() {
    this.uploaded = true;
  }
}
