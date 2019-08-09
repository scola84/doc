import {
  Worker
} from '@scola/worker';

import {
  MessageSender,
  SqlBuilder
} from '../worker';

export function setup() {
  Worker.setLog(Worker.log);

  MessageSender.setup();
  SqlBuilder.setup();
}
