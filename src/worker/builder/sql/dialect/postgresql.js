import pg from 'pg';
import sqlstring from 'sqlstring';
import { Dialect } from './dialect';

if (typeof pg !== 'undefined') {
  pg.types.setTypeParser(1082, (value) => value);
}

const pools = {};

export class Postgresql extends Dialect {
  escape(value, type) {
    if (type === 'value') {
      return sqlstring.escape(value);
    }

    if (type === 'id') {
      return '"' + value.replace(/\./g, '"."') + '"';
    }

    return value;
  }

  execute(box, data, query, callback) {
    this.open(box, data, (cerror, connection, release = true) => {
      if (cerror) {
        callback(cerror);
        return;
      }

      connection.query(query, (error, result = {}) => {
        if (release) {
          connection.release();
        }

        callback(error, result.rows);
      });
    });
  }

  open(box, data, callback) {
    const host = this._options.host;

    if (typeof pools[host] === 'undefined') {
      pools[host] = new pg.Pool(this._options);
    }

    const connection = this._builder.getConnection();

    if (connection) {
      connection(box, data, pools[host], callback);
      return;
    }

    if (box.connection) {
      callback(null, box.connection, false);
      return;
    }

    pools[host].connect(callback);
  }

  stream(box, data, query, callback) {
    callback(new Error('Streaming not supported'));
  }
}
