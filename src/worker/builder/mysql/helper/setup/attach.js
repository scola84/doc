import camel from 'lodash-es/camelCase';
import { MysqlBuilder } from '../../../mysql';
import { Snippet, snippet } from '../../snippet';
import * as token from '../../token';

export function attach() {
  function normalize(item) {
    return typeof item === 'string' ? {
      name: camel(item),
      token: item
    } : item;
  }

  Snippet.ESCAPE_NONE = 0;
  Snippet.ESCAPE_VALUE = 1;
  Snippet.ESCAPE_ID = 2;

  MysqlBuilder.prototype.ESCAPE_NONE = Snippet.ESCAPE_NONE;
  MysqlBuilder.prototype.ESCAPE_VALUE = Snippet.ESCAPE_VALUE;
  MysqlBuilder.prototype.ESCAPE_ID = Snippet.ESCAPE_ID;

  MysqlBuilder.attachFactory('', 'query', Snippet, {
    infix: ' '
  });

  MysqlBuilder.attachFactory('', 'string', Snippet, {
    escape: Snippet.ESCAPE_VALUE,
    infix: ' '
  });

  MysqlBuilder.attachFactory('', 'from', Snippet, {
    infix: '',
    prefix: 'FROM '
  });

  Object.keys(snippet).forEach((name) => {
    MysqlBuilder.attachFactory('', name, snippet[name]);
  });

  token.infix.forEach((item) => {
    item = normalize(item);

    MysqlBuilder.attachFactory('op', item.name, Snippet, {
      infix: ` ${item.token} `
    });
  });

  token.prefix.forEach((item) => {
    item = normalize(item);

    MysqlBuilder.attachFactory('pre', item.name, Snippet, {
      prefix: `${item.token} `
    });
  });

  token.postfix.forEach((item) => {
    item = normalize(item);

    MysqlBuilder.attachFactory('post', item.name, Snippet, {
      postfix: ` ${item.token}`
    });
  });

  token.func.forEach((item) => {
    item = normalize(item);

    MysqlBuilder.attachFactory('fn', item.name, Snippet, {
      parens: true,
      prefix: item.token
    });
  });

}
