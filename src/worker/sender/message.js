import { Builder, vsprintf } from '@scola/worker'
import * as map from './message/map'

let hosts = {}

export class MessageSender extends Builder {
  static setup () {
    MessageSender.attachFactories(MessageSender, map)
  }

  static getHosts () {
    return hosts
  }

  static setHosts (value) {
    hosts = value
  }

  constructor (options = {}) {
    super(options)

    this._host = null
    this._transport = null

    this.setHost(options.host)
    this.setTransport(options.transport)
  }

  getOptions () {
    return Object.assign(super.getOptions(), {
      host: this._host,
      transport: this._transport
    })
  }

  getHost () {
    return this._host
  }

  setHost (value = 'default') {
    this._host = value
    return this
  }

  getTransport () {
    return this._transport
  }

  setTransport (value = null) {
    this._transport = value
    return this
  }

  act (box, data, callback) {
    if (this._transport === null) {
      this.createTransport()
    }

    const message = this.sprintf(
      this.filter(box, data)
    )

    this._transport.send(message, (error, result) => {
      if (error) {
        this.handleError(box, data, callback, error)
        return
      }

      this.handleSend(box, data, callback, result)
    })
  }

  createTransport () {
    const options = hosts[this._host] || {}

    if (typeof this[options.transport] === 'undefined') {
      throw new Error('Transport not defined')
    }

    this.setTransport(
      this[options.transport]().options(options)
    )
  }

  handleError (box, data, callback, error) {
    error.data = data
    this.fail(box, error, callback)
  }

  handleSend (box, data, callback, result) {
    try {
      data = this.merge(box, data, { result })
      this.pass(box, data, callback)
    } catch (error) {
      this.handleError(box, data, callback, error)
    }
  }

  sprintf (data) {
    data.subject = vsprintf(data.subject, [data.data])
    data.text = vsprintf(data.text, [data.data])

    if (typeof data.html !== 'undefined') {
      data.html = vsprintf(
        data.html.replace(/%([^s])/g, '%%$1'),
        [vsprintf('%m', [data.text])]
      )
    }

    return data
  }
}
