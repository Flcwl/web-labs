const WebSocket = require('ws')

let wss = null

const getWss = () => wss

const createWss = () => {
  if (!wss) {
    wss = new WebSocket.Server({
      port: 8081,
    })
  }

  return wss
}

module.exports = {
  createWss: createWss,
  getWss: getWss,
}
