import { Snippet } from '../snippet';

export class Slice extends Snippet {
  constructor(options = {}) {
    super(options);

    this._count = null;
    this._max = null;
    this._offset = null;

    this.setCount(options.count);
    this.setMax(options.max);
    this.setOffset(options.offset);
  }

  getCount() {
    return this._count;
  }

  setCount(value = null) {
    this._count = value;
    return this;
  }

  getMax() {
    return this._max;
  }

  setMax(value = 100) {
    this._max = value;
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

  max(value) {
    return this.setMax(value);
  }

  offset(value) {
    return this.setOffset(value);
  }

  resolveInner(box, data) {
    const count = parseFloat(
      this.resolveValue(box, data, this._count)
    );

    const offset = parseFloat(
      this.resolveValue(box, data, this._offset)
    );

    if (
      Number.isInteger(count) === false ||
      Number.isInteger(offset) === false ||
      count > this._max
    ) {
      throw new Error('400 Slice parameters are invalid');
    }

    return this.resolveParens(
      `${count} OFFSET ${offset}`,
      this._parens
    );
  }
}
