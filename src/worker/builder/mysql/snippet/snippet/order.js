import { Snippet } from '../snippet';

export class Order extends Snippet {
  constructor(options = {}) {
    super(options);

    this._by = null;
    this._columns = null;
    this._default = null;
    this._order = null;

    this.setBy(options.by);
    this.setColumns(options.columns);
    this.setDefault(options.default);
    this.setOrder(options.order);
  }

  getBy() {
    return this._by;
  }

  setBy(value = null) {
    this._by = value;
    return this;
  }

  getColumns() {
    return this._columns;
  }

  setColumns(value = []) {
    this._columns = value;
    return this;
  }

  getDefault() {
    return this._default;
  }

  setDefault(value = '1') {
    this._default = value;
    return this;
  }

  getOrder() {
    return this._order;
  }

  setOrder(value = null) {
    this._order = value;
    return this;
  }

  by(value) {
    return this.setBy(value);
  }

  columns(value) {
    return this.setColumns(value);
  }

  default (value) {
    return this.setDefault(value);
  }

  order(value) {
    return this.setOrder(value);
  }

  resolveInner(box, data) {
    const columns = this.resolveValue(box, data, this._columns);
    const directions = ['ASC', 'DESC'];

    let order = this.resolveValue(box, data, this._order);
    let by = this.resolveValue(box, data, this._by);

    order = Array.isArray(order) ? order : [order];
    by = Array.isArray(by) ? by : [by];

    let column = null;
    let direction = null;
    let string = '';

    for (let i = 0; i < order.length; i += 1) {
      column = order[i];
      direction = by[i] || 'ASC';

      if (columns.indexOf(column) === -1) {
        continue;
      }

      if (directions.indexOf(direction) === -1) {
        continue;
      }

      string += string.length ? ', ' : '';
      string += column;
      string += ' ';
      string += direction;
    }

    if (string.length === 0) {
      string = this.resolveValue(box, data, this._default);
    }

    return this.resolveParens(string, this._parens);
  }
}
