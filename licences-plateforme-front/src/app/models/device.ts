import { Client } from "./client";

export class Device {
  _id?: string;               // Optional because MongoDB generates it
  client?: Client | string;    // Can be a Client object or just its _id
  reference?: string;
  description?: string;
  vendor?: string;
  serialNumber?: string;
  startDate?: string | Date;   // Can be ISO string or Date object
  endDate?: string | Date;
}