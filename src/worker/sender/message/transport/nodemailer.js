import defaults from 'lodash-es/defaultsDeep';
import nodemailer from 'nodemailer';

export class Nodemailer {
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
    this._options = defaults({}, value, {
      pool: true
    });

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
    this.setTransport(
      nodemailer.createTransport(this._options)
    );
  }

  send(message, callback) {
    if (this._transport === null) {
      this.createTransport();
    }

    this._transport.sendMail(message, callback);
  }
}
