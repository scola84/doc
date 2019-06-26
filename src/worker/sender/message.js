import { Worker } from '@scola/worker';
import camel from 'lodash-es/camelCase';
import marked from 'marked';
import sprintf from 'sprintf-js';
import * as setup from './message/helper/setup';

export class MessageSender extends Worker {
  static attachFactory(name, object) {
    MessageSender.prototype[
      camel(name)
    ] = function create(options) {
      return new object(options);
    };
  }

  static setup(...names) {
    names = names.length === 0 ? Object.keys(setup) : names;
    names.forEach((name) => setup[name]());
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
