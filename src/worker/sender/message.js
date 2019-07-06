import { Worker } from '@scola/worker';
import marked from 'marked';
import sprintf from 'sprintf-js';
import { token } from './message/';

let hosts = {};

export class MessageSender extends Worker {
  static setup() {
    MessageSender.attach(MessageSender, { token });
  }

  static getHosts() {
    return hosts;
  }

  static setHosts(value) {
    hosts = value;
  }

  constructor(options = {}) {
    super(options);

    this._transport = null;
    this.setTransport(options.transport);
  }

  getTransport() {
    return this._transport;
  }

  setTransport(value = null) {
    this._transport = value;
    return this;
  }

  transport(value) {
    return this.setTransport(value);
  }

  mapHost(name) {
    return hosts[name];
  }

  act(box, data, callback) {
    data = this.filter(box, data);
    data = this.sprintf(data);

    this._transport.send(data, (error, result) => {
      if (error) {
        this.handleError(box, data, callback, error);
        return;
      }

      this.handleSend(box, data, callback, result);
    });
  }

  handleError(box, data, callback, error) {
    error.data = data;
    this.fail(box, error, callback);
  }

  handleSend(box, data, callback, result) {
    try {
      data = this.merge(box, data, { result });
      this.pass(box, data, callback);
    } catch (error) {
      this.handleError(box, data, callback, error);
    }
  }

  sprintf(data) {
    data.subject = sprintf.sprintf(data.subject, data.data);
    data.text = sprintf.sprintf(data.text, data.data);

    if (typeof data.html !== 'undefined') {
      this.sprintfHtml(data);
    }

    return data;
  }

  sprintfHtml(data) {
    const wrap = data.html.replace(/%([^s])/g, '%%$1');

    const html = marked(data.text, {
      breaks: true,
      sanitize: true
    });

    data.html = sprintf.sprintf(wrap, html);
  }
}
