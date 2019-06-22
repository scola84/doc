import { Worker } from '@scola/worker';
import camel from 'lodash-es/camelCase';
import merge from 'lodash-es/merge';
import mysql from 'mysql';
import * as setup from './mysql/helper/setup';

const hosts = {};
const pools = {};

export class MysqlBuilder extends Worker {
  static attachFactory(prefix, name, object, options = {}) {
    MysqlBuilder.prototype[
      camel(MysqlBuilder.prototype[name] ?
        `${prefix}-${name}` : name)
    ] = function create(...list) {
      return new object(Object.assign(options, {
        builder: this,
        list,
        name
      }));
    };
  }

  static setup(...names) {
    names = names.length === 0 ? Object.keys(setup) : names;
    names.forEach((name) => setup[name]());
  }

  static getHosts() {
    return hosts;
  }

  static setHosts(value) {
    merge(hosts, value);
  }

  constructor(options = {}) {
    super(options);

    this._connection = null;
    this._host = null;
    this._key = null;
    this._nest = null;
    this._query = null;
    this._timeout = null;
    this._type = null;

    this.setConnection(options.connection);
    this.setHost(options.host);
    this.setKey(options.key);
    this.setNest(options.nest);
    this.setQuery(options.query);
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

  setHost(value = null) {
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

    if (this._log === 'query') {
      console.log(query.sql);
    }

    this.open(box, data, (oerror, connection, close = true) => {
      if (oerror) {
        this.handleError(box, data, callback, oerror);
        return;
      }

      connection.query(query, (qerror, result) => {
        try {
          if (close) {
            connection.release();
          }

          if (qerror) {
            this.handleError(box, data, callback, qerror);
            return;
          }

          data = this.merge(box, data, {
            key: this._key,
            query,
            result
          });

          this.pass(box, data, callback);
        } catch (terror) {
          this.handleError(box, data, callback, terror);
        }
      });
    });
  }

  build(query) {
    return this.setQuery(query);
  }

  createPool(box, data) {
    const hostname = this.formatHostname(box, data);
    const shard = this.formatShard(box, data);

    const index = shard === null ?
      0 :
      Math.floor(shard / hosts[hostname].shards);

    const pool = hostname + index;

    if (typeof pools[pool] === 'undefined') {
      const options = this.resolve(
        box,
        data,
        hosts[hostname] && hosts[hostname].options || {},
        index
      );

      pools[pool] = mysql.createPool(options);
    }

    return pools[pool];
  }

  formatDatabase(box, data, hostname) {
    return this.resolve(
      box,
      data,
      hosts[hostname] && hosts[hostname].database || null
    );
  }

  formatHostname(box, data) {
    return this.resolve(
      box,
      data,
      this._host && this._host.name || 'default' || null
    );
  }

  formatShard(box, data) {
    return this.resolve(
      box,
      data,
      this._host && this._host.shard || null
    );
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
}