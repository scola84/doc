import trim from 'lodash-es/trim';
import { Snippet } from '../snippet';

export class Search extends Snippet {
  setParens(value = true) {
    return super.setParens(value);
  }

  resolveInner(box, data) {
    const [
      column,
      value = '',
      operator = 'AND',
      wildcard = /\*/g
    ] = this._args;

    const match = value.match(/[^"\s]+|"[^"]+"/g) || [];
    let string = '';

    for (let i = 0; i < match.length; i += 1) {
      string += string.length ? ` ${operator} ` : '';
      string += this.resolveValue(box, data, column);
      string += ' LIKE ';
      string += this.resolveEscape(
        trim(match[i].replace(wildcard, '%')),
        'value'
      );
    }

    string = string || 1;

    return this.resolveParens(string, this._parens);
  }
}
