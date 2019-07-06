import nodemailer from 'nodemailer';
import { Transport } from './transport';

export class Nodemailer extends Transport {
  createClient() {
    this.setClient(
      nodemailer.createTransport(
        this._builder.mapHost(this._host)
      )
    );
  }

  send(message, callback) {
    if (this._client === null) {
      this.createClient();
    }

    this._client.sendMail(message, callback);
  }
}
