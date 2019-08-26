import {
  MessageSender,
  SqlBuilder
} from '../worker'

export function setup () {
  console.out = (type, worker, box, data) => {
    if (type === 'fail' && !data.logged) {
      data.logged = true
      console.error(data)
    }
  }

  MessageSender.setup()
  SqlBuilder.setup()
}
