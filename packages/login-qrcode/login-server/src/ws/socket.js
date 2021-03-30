const sendData = (client, data, status = 200) => {
  if (client && client.send) {
    client.send(
      JSON.stringify({
        status: status,
        data: data,
      })
    )
  }
}

const initWebsocket = (wss) => {
  wss.on('connection', (ws) => {
    console.log(`[SERVER] connection`)
    // 接收到数据
    ws.on('message', (msg) => {
      console.log(`[SERVER] Received: ${msg}`)
      // 发送数据
      const res = JSON.parse(msg)
      const fn = messageHandler[res.type]

      if (fn) {
        fn(ws, res.data)
      } else {
        ws.send('bad command!')
      }
    })
  })
}

const messageHandler = {
  START_LOGIN: (ws, data) => {
    console.log('开始二维码登录----', data)

    ws.loginCondition = {
      uuid: data.uuid,
      status: 0
    }

    sendData(ws, {
      type: 'SHOW_QR_CODE',
    })
  },
}

module.exports = {
  initWebsocket: initWebsocket,
  sendData: sendData,
}
