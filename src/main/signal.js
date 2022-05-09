const EventEmitter = require('events')
const WebSocket = require('ws')
const signal = new EventEmitter()
const ws = new WebSocket('ws://127.0.0.1:9090')
ws.on('open', () => {
  console.log('connect success')
})
ws.on('message', message => {
  let data = {}
  try {
    data = JSON.parse(message)
  } catch (err) {
    console.log('parse error:', err)
  }
  signal.emit(data.event, data.data)
})
function send(event, data) {
  console.log(event, data)
  ws.send(JSON.stringify({event, data}))
}
function invoke(event, data, resultEvent, wait = 5000) {
  return new Promise((resolve, reject) => {
    send(event, data)
    signal.once(resultEvent, resolve)
    setTimeout(() => {
      reject('timeout')
    }, wait)
  })
}

signal.send = send
signal.invoke = invoke

module.exports = signal
