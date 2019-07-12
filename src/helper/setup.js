import {
  Worker
} from '@scola/worker';

import {
  MessageSender,
  MysqlBuilder
} from '../worker';

export function setup() {
  Worker.setLog(Worker.log);

  MessageSender.setup();
  MysqlBuilder.setup();
}
