export class Transport {
  constructor(options = {}) {
    this._builder = null;
    this._client = null;
    this._host = null;

    this.setBuilder(options.builder);
    this.setClient(options.client);
    this.setHost(options.host);
  }

  getBuilder() {
    return this._builder;
  }

  setBuilder(value = null) {
    this._builder = value;
    return this;
  }

  getClient() {
    return this._client;
  }

  setClient(value = null) {
    this._client = value;
    return this;
  }

  getHost() {
    return this._host;
  }

  setHost(value = null) {
    this._host = value;
    return this;
  }

  host(value) {
    return this.setHost(value);
  }

  send() {}
}
