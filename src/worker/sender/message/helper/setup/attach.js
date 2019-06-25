import { MessageSender } from '../../../message';
import * as transport from '../../transport';

export function attach() {
  Object.keys(transport).forEach((name) => {
    MessageSender.attachFactory(name, transport[name]);
  });
}
