import messagebird from 'messagebird';

export class Messagebird {
  constructor(options = {}) {
    this._options = null;
    this._transport = null;

    this.setOptions(options.options);
    this.setTransport(options.transport);
  }

  getOptions() {
    return this._options;
  }

  setOptions(value = null) {
    this._options = value;
    return this;
  }

  getTransport() {
    return this._transport;
  }

  setTransport(value = null) {
    this._transport = value;
    return this;
  }

  createTransport() {
    this.setTransport(messagebird(this._options));
  }

  send(message, callback) {
    if (this._transport === null) {
      this.createTransport();
    }

    this._transport.messages.create({
      originator: message.from,
      recipients: [
        message.to
      ],
      body: message.text
    }, callback);
  }
}
