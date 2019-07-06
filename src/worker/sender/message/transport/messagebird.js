import messagebird from 'messagebird';
import { Transport } from './transport';

export class Messagebird extends Transport {
  createClient() {
    this.setClient(
      messagebird(
        this._builder.mapHost(this._host)
      )
    );
  }

  send(message, callback) {
    if (this._client === null) {
      this.createClient();
    }

    this._client.messages.create({
      originator: message.from,
      recipients: [
        message.to
      ],
      body: message.text
    }, callback);
  }
}
