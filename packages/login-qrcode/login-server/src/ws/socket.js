const uuid = require('uuid')

const sendData = (client, status, data) => {
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
      const fn = loginMessageHandler[msg]
      if (fn) {
        fn(ws)
      } else {
        ws.send('bad command!')
      }
    })
  })
}

// 处理登录消息，根据客户端发来的消息匹配相应的业务逻辑操作函数
const loginMessageHandler = {
  GET_CODE: (ws) => {
    const uid = uuid.v4()
    console.log('获取二维码----' + uid)

    ws.loginCondition = {
      uuid: uid,
      status: 0,
    }
    
    sendData(ws, 'ok', {
      uuid: uid,
      type: 'CODE_ID',
    })
  },
}

module.exports = {
  initWebsocket: initWebsocket,
  sendData: sendData,
}
