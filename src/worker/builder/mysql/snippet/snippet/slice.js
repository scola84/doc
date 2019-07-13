import { Snippet } from '../snippet';

export class Slice extends Snippet {
  constructor(options = {}) {
    super(options);

    this._count = null;
    this._default = null;
    this._offset = null;

    this.setCount(options.count);
    this.setDefault(options.default);
    this.setOffset(options.offset);
  }

  getCount() {
    return this._count;
  }

  setCount(value = null) {
    this._count = value;
    return this;
  }

  getDefault() {
    return this._default;
  }

  setDefault(value = '10 OFFSET 0') {
    this._default = value;
    return this;
  }

  getOffset() {
    return this._offset;
  }

  setOffset(value = null) {
    this._offset = value;
    return this;
  }

  count(value) {
    return this.setCount(value);
  }

  default (value) {
    return this.setDefault(value);
  }

  offset(value) {
    return this.setOffset(value);
  }

  resolveInner(box, data) {
    const count = this.resolveValue(box, data, this._count);
    const offset = this.resolveValue(box, data, this._offset);

    let string = '';

    if (
      Number.isInteger(parseFloat(count)) === false ||
      Number.isInteger(parseFloat(offset)) === false
    ) {
      string = this.resolveValue(box, data, this._default);
    } else {
      string = `${count} OFFSET ${offset}`;
    }

    return this.resolveParens(string, this._parens);
  }
}
