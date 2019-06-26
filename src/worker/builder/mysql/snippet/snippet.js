import sqlstring from 'sqlstring';
import toPath from 'lodash-es/toPath';

let id = 0;

export class Snippet {
  constructor(options = {}) {
    this._allow = null;
    this._builder = null;
    this._escape = null;
    this._id = null;
    this._infix = null;
    this._list = null;
    this._name = null;
    this._parens = null;
    this._postfix = null;
    this._prefix = null;

    this.setAllow(options.allow);
    this.setBuilder(options.builder);
    this.setEscape(options.escape);
    this.setId(options.id);
    this.setInfix(options.infix);
    this.setList(options.list);
    this.setName(options.name);
    this.setParens(options.parens);
    this.setPostfix(options.postfix);
    this.setPrefix(options.prefix);
  }

  clone() {
    const options = this.getOptions();

    options.list = options.list.map((snippet) => {
      return snippet instanceof Snippet ?
        snippet.clone() : snippet;
    });

    return new this.constructor(options);
  }

  getOptions() {
    return {
      allow: this._allow,
      builder: this._builder,
      escape: this._escape,
      id: this._id,
      infix: this._infix,
      list: this._list,
      name: this._name,
      parens: this._parens,
      postfix: this._postfix,
      prefix: this._prefix
    };
  }

  getAllow() {
    return this._allow;
  }

  setAllow(value = null) {
    this._allow = value;
    return this;
  }

  getBuilder() {
    return this._builder;
  }

  setBuilder(value = null) {
    this._builder = value;
    return this;
  }

  getEscape() {
    return this._escape;
  }

  setEscape(value = Snippet.ESCAPE_NONE) {
    this._escape = value;
    return this;
  }

  getId() {
    return this._id;
  }

  setId(value = ++id) {
    this._id = value;
    return this;
  }

  getInfix() {
    return this._infix;
  }

  setInfix(value = ', ') {
    this._infix = value;
    return this;
  }

  getItem(index) {
    return this._list[index];
  }

  setItem(index, value) {
    this._list[index] = value;
    return this;
  }

  getList() {
    return this._list;
  }

  setList(value = []) {
    this._list = value;
    return this;
  }

  getName() {
    return this._name;
  }

  setName(value = null) {
    this._name = value;
    return this;
  }

  getParens() {
    return this._parens;
  }

  setParens(value = false) {
    this._parens = value;
    return this;
  }
  getPostfix() {
    return this._postfix;
  }

  setPostfix(value = '') {
    this._postfix = value;
    return this;
  }

  getPrefix() {
    return this._prefix;
  }

  setPrefix(value = '') {
    this._prefix = value;
    return this;
  }

  allow(value) {
    return this.setAllow(value);
  }

  escape(value = Snippet.ESCAPE_VALUE) {
    return this.setEscape(value);
  }

  parens() {
    return this.setParens(true);
  }

  concat(left, right) {
    const hasDouble = left[left.length - 1] === ' ' && right[0] === ' ';
    return left + (hasDouble ? right.slice(1) : right);
  }

  find(path, index) {
    path = toPath(path);

    let result = [];
    let snippet = null;

    if (
      path[0] === this._name ||
      path[0] === index ||
      path[0] === '*'
    ) {
      if (path.length === 1) {
        result[result.length] = this;
      } else {
        result = result.concat(this.find(path.slice(1)));
      }

      return result;
    }

    for (let i = 0; i < this._list.length; i += 1) {
      snippet = this._list[i];

      if (snippet instanceof Snippet) {
        result = result.concat(snippet.find(path, String(i)));
      }
    }

    return result;
  }

  isAllowed(box, data) {
    return this.resolveValue(box, data, this._allow);
  }

  resolve(box, data) {
    const isAllowed = this.isAllowed(box, data);

    if (isAllowed === false) {
      return null;
    }

    let string = '';

    string = this.concat(string, this._prefix);
    string = this.concat(string, this.resolveInner(box, data));
    string = this.concat(string, this._postfix);

    return string;
  }

  resolveEscape(value, type) {
    if (type === Snippet.ESCAPE_VALUE) {
      return sqlstring.escape(value);
    }

    if (type === Snippet.ESCAPE_ID) {
      return sqlstring.escapeId(value);
    }

    return value;
  }

  resolveInner(box, data) {
    let string = '';

    let count = 0;
    let value = null;

    for (let i = 0; i < this._list.length; i += 1) {
      value = this.resolveValue(box, data, this._list[i]);

      if (value === null) {
        continue;
      }

      if (count > 0) {
        string = this.concat(string, this._infix);
      }

      string = this.concat(string, value);

      count += 1;
    }

    return this.resolveParens(string, this._parens);
  }

  resolveParens(value, parens) {
    return parens && value ? `(${value})` : value;
  }

  resolveValue(box, data, value) {
    if (value === null || typeof value === 'undefined') {
      return value;
    }

    if (typeof value === 'function') {
      return this.resolveValue(box, data, value(box, data));
    }

    if (typeof value.resolve === 'function') {
      return this.resolveValue(box, data, value.resolve(box, data));
    }

    if (typeof value === 'string') {
      return this.resolveEscape(value, this._escape);
    }

    return value;
  }

  set(path, index, value) {
    const list = this.find(path);

    for (let i = 0; i < list.length; i += 1) {
      list[i].setItem(index, value);
    }

    return list;
  }
}
