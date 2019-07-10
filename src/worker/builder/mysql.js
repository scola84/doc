import { Builder } from '@scola/worker';
import mysql from 'mysql';
import * as map from './mysql/map';

let hosts = {};
const pools = {};

export class MysqlBuilder extends Builder {
  static setup() {
    MysqlBuilder.attachFactories(MysqlBuilder, map);
  }

  static getHosts() {
    return hosts;
  }

  static setHosts(value) {
    hosts = value;
  }

  constructor(options = {}) {
    super(options);

    this._connection = null;
    this._host = null;
    this._key = null;
    this._nest = null;
    this._query = null;
    this._stream = null;
    this._timeout = null;
    this._type = null;

    this.setConnection(options.connection);
    this.setHost(options.host);
    this.setKey(options.key);
    this.setNest(options.nest);
    this.setQuery(options.query);
    this.setStream(options.stream);
    this.setTimeout(options.timeout);
    this.setType(options.type);
  }

  getOptions() {
    return Object.assign(super.getOptions(), {
      connection: this._connection,
      host: this._host,
      key: this._key,
      nest: this._nest,
      query: this._query,
      stream: this._stream,
      timeout: this._timeout,
      type: this._type
    });
  }

  getConnection() {
    return this._connection;
  }

  setConnection(value = null) {
    this._connection = value;
    return this;
  }

  getHost() {
    return this._host;
  }

  setHost(value = 'default') {
    this._host = value;
    return this;
  }

  getKey() {
    return this._key;
  }

  setKey(value = null) {
    this._key = value;
    return this;
  }

  getNest() {
    return this._nest;
  }

  setNest(value = false) {
    this._nest = value;
    return this;
  }

  getQuery() {
    return this._query;
  }

  setQuery(query = null) {
    this._query = query;
    return this;
  }

  getStream() {
    return this._stream;
  }

  setStream(value = null) {
    this._stream = value;
    return this;
  }

  getTimeout() {
    return this._timeout;
  }

  setTimeout(value = null) {
    this._timeout = value;
    return this;
  }

  getType() {
    return this._type;
  }

  setType(value = null) {
    this._type = value;
    return this;
  }

  act(box, data, callback) {
    data = this.filter(box, data);

    const query = {
      nestTables: this._nest,
      sql: this._query.resolve(box, data),
      timeout: this._timeout
    };

    this.log('info', box, data, query);

    this.open(box, data, (oerror, connection, close = true) => {
      if (oerror) {
        this.handleError(box, data, callback, oerror);
        return;
      }

      if (this._stream) {
        this.handleStream(box, data, callback, connection, query);
        return;
      }

      connection.query(query, (error, result) => {
        if (close) {
          connection.release();
        }

        if (error) {
          this.handleError(box, data, callback, error);
          return;
        }

        this.handleQuery(box, data, callback, query, result);
      });
    });
  }

  build(query) {
    return this.setQuery(query);
  }

  createPool() {
    if (typeof pools[this._host] === 'undefined') {
      pools[this._host] = mysql.createPool(
        this.mapHost(this._host)
      );
    }

    return pools[this._host];
  }

  handleError(box, data, callback, error) {
    if (error.code === 'ER_DUP_ENTRY') {
      error = this.handleErrorDuplicate(error);
    }

    error.data = data;

    this.fail(box, error, callback);
  }

  handleErrorDuplicate(error) {
    const reason = 'duplicate_' +
      (error.message.match(/key '(.+)'/) || ['key']).pop();

    error = new Error('409 Object already exists');
    error.reason = reason.toLowerCase();

    return error;
  }

  handleQuery(box, data, callback, query, result) {
    try {
      data = this.merge(box, data, {
        key: this._key,
        query,
        result
      });

      this.pass(box, data, callback);
    } catch (error) {
      this.handleError(box, data, callback, error);
    }
  }

  handleStream(box, data, callback, connection, query) {
    const stream = connection.query(query);

    stream.on('error', (error) => {
      stream.removeAllListeners();
      this.handleError(box, data, callback, error);
    });

    stream.on('result', (row) => {
      this.pass(box, row, (bx, resume) => {
        if (resume === false) {
          connection.pause();
          return;
        }

        connection.resume();
      });
    });

    stream.on('end', () => {
      stream.removeAllListeners();
      this.pass(box, null, callback);
    });
  }

  mapHost(name) {
    return hosts[name];
  }

  merge(box, data, { key, query, result }) {
    if (this._merge) {
      return this._merge(box, data, { key, query, result });
    }

    if (this._type === 'list') {
      return { data: result };
    }

    if (this._type === 'object') {
      return { data: result[0] };
    }

    return result;
  }

  open(box, data, callback) {
    const pool = this.createPool(box, data);

    if (this._connection) {
      this._connection(box, data, pool, callback);
      return;
    }

    if (box.connection) {
      callback(null, box.connection, false);
      return;
    }

    pool.getConnection(callback);
  }

  selector(...args) {
    return this._query.selector(...args);
  }
}
