import {
  MessageSender,
  MysqlBuilder
} from '../worker';

export function setup() {
  MessageSender.setup();
  MysqlBuilder.setup();
}
