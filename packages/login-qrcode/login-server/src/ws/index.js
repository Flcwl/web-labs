const WebSocket = require('ws')

let wss = null

const getWss = () => wss

const createWss = (server) => {
  if (!wss) {
    wss = new WebSocket.Server({
      server: server,
    })
  }

  return wss

}

module.exports = {
  createWss: createWss,
  getWss: getWss,
}
