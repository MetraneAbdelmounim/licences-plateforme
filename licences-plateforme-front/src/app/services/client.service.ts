import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

const BACKEND_URL = environment.apiUri
@Injectable({
  providedIn: 'root'
})
export class ClientService {

    constructor(private http:HttpClient) { }

   getAllClients(){
    return this.http.get(BACKEND_URL+'clients')
  }
  getclientByID(idClient:string){
    return this.http.get(BACKEND_URL+'clients/'+idClient)
  }
  addClient(stockData:any) {
    return this.http.post(BACKEND_URL+'clients/',stockData)
  }
 editClient(_id: string | undefined, clientData: any) {

    return this.http.put(BACKEND_URL+'clients/'+_id,clientData)
  }
  deleteClient(_id: string) {
    return this.http.delete(BACKEND_URL+'clients/'+_id)
  }
}
