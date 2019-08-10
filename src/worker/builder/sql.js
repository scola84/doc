import { Builder } from '@scola/worker';
import groupBy from 'lodash-es/groupBy';
import * as map from './sql/map';

let hosts = {};

export class SqlBuilder extends Builder {
  static setup() {
    SqlBuilder.attachFactories(SqlBuilder, map);
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
    this._dialect = null;
    this._host = null;
    this._key = null;
    this._query = null;
    this._stream = null;
    this._type = null;

    this.setConnection(options.connection);
    this.setDialect(options.dialect);
    this.setHost(options.host);
    this.setKey(options.key);
    this.setQuery(options.query);
    this.setStream(options.stream);
    this.setType(options.type);
  }

  getOptions() {
    return Object.assign(super.getOptions(), {
      connection: this._connection,
      dialect: this._dialect,
      host: this._host,
      key: this._key,
      query: this._query,
      stream: this._stream,
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

  getDialect() {
    return this._dialect;
  }

  setDialect(value = null) {
    this._dialect = value;
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

  setStream(value = false) {
    this._stream = value;
    return this;
  }

  getType() {
    return this._type;
  }

  setType(value = null) {
    this._type = value;
    return this;
  }

  createDialect() {
    const options = hosts[this._host];

    if (typeof this[options.dialect] === 'undefined') {
      throw new Error('Dialect not defined');
    }

    this.setDialect(
      this[options.dialect]().options(options)
    );
  }

  act(box, data, callback) {
    if (this._dialect === null) {
      this.createDialect();
    }

    const query = this._query.resolve(
      box,
      this.filter(box, data)
    );

    this.log('info', box, data, query);

    if (this._stream) {
      this._dialect.stream(box, data, query, (error, result) => {
        this.process(box, data, query, error, result, callback);
      });
    } else {
      this._dialect.execute(box, data, query, (error, row, cb) => {
        this.process(box, data, query, error, row, cb);
      });
    }
  }

  build(query) {
    return this.setQuery(query);
  }

  escape(value, type) {
    return this._dialect.escape(value, type);
  }

  merge(box, data, { query, result }) {
    if (this._merge) {
      return this._merge(box, data, {
        key: this._key,
        query,
        result
      });
    }

    if (this._type === 'insert') {
      return {
        data: {
          [this._key]: result
        }
      };
    }

    if (this._type === 'link') {
      return {
        data: groupBy(result, (item) => {
          const link = item.__link;
          delete item.__link;
          return link;
        })
      };
    }

    if (this._type === 'list') {
      return {
        data: result
      };
    }

    if (this._type === 'object') {
      return {
        data: result[0]
      };
    }

    return { data: {} };
  }

  process(box, data, query, error, result, callback) {
    if (error) {
      this.fail(box, error, callback);
      return;
    }

    if (this._stream === false) {
      result = this.merge(box, data, { query, result });
    }

    this.pass(box, result, callback);
  }

  selector(...args) {
    return this._query.selector(...args);
  }
}
