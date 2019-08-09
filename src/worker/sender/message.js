import { Builder } from '@scola/worker';
import marked from 'marked';
import sprintf from 'sprintf-js';
import * as map from './message/map';

let hosts = {};

export class MessageSender extends Builder {
  static setup() {
    MessageSender.attachFactories(MessageSender, map);
  }

  static getHosts() {
    return hosts;
  }

  static setHosts(value) {
    hosts = value;
  }

  constructor(options = {}) {
    super(options);

    this._host = null;
    this._transport = null;

    this.setHost(options.host);
    this.setTransport(options.transport);
  }

  getHost() {
    return this._host;
  }

  setHost(value = 'default') {
    this._host = value;
    return this;
  }

  getTransport() {
    return this._transport;
  }

  setTransport(value = null) {
    this._transport = value;
    return this;
  }

  host(value) {
    return this.setHost(value);
  }

  transport(value) {
    return this.setTransport(value);
  }

  createTransport() {
    const options = hosts[this._host] || {};

    console.log(hosts, this._host);

    if (typeof this[options.transport] === 'undefined') {
      throw new Error('Transport not defined');
    }

    this._transport = this[options.transport]().options(options);
  }

  act(box, data, callback) {
    if (this._transport === null) {
      this.createTransport();
    }

    const message = this.sprintf(
      this.filter(box, data)
    );

    this._transport.send(message, (error, result) => {
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
