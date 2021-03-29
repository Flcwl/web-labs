const path = require('path')
const uuid = require('uuid')
const qr = require('qr-image')
const app = require('../api')
const { getWss } = require('../ws')
const { sendData } = require('../ws/socket')
const { verify, generate } = require('../utils/jwt')

// hello world
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.json(genJson(null, 'Hello, World~'))
  res.end()
})

// 获取携带 uuid 的二维码
app.get('/login/qrcode', (req, res) => {
  const uid = uuid.v4()

  const isExpired = false // 过期验证（略去）

  if (!uid || isExpired) {
    res.json(genJson(null, '二维码已过期'))
    res.end()
    return
  }

  const qrImg = qr.image(uid, {
    size: 12,
    margin: 1,
    type: 'png',
  })

  const imgFile = `qr_${uid}.png`
  const imgPath = path.join(__dirname, `../assets/${imgFile}`)

  qrImg.pipe(require('fs').createWriteStream(imgPath))

  res.json(
    genJson({
      // codeId: uid,
      qrImage: `http://localhost:4000/static/${imgFile}`,
    })
  )

  res.end()
})

// 直接登录，返回 userToken
app.get('/login/token', (req, res) => {
  const USER_ID = 'flcwl' // mock with no sql
  const token = generate(USER_ID)

  const body = {
    token,
  }

  res.json(genJson(body, '登录成功~'))

  res.end()
})

// 扫码确认登录，范围 userToken
app.get('/login/confirm', (req, res) => {
  const { token } = req.body
  const tokenData = verify(token)

  const uuid = req.body['uuid']

  const wss = getWss()

  if (wss && wss.clients && tokenData) {
    // 可以在 wss.clients 中找到相应的客户端
    const clients = [...wss.clients]

    // 找到对应的 ws 客户端
    const targetClient = clients.find((client) => client.loginCondition.uuid === uuid)

    if (targetClient) {
      switch (targetClient.loginCondition.status) {
        case 0:
          res.json(genJson(null, '二维码扫描成功，请点击确认按钮以确认登录~'))
          sendData(targetClient, 'ok', {
            uuid: uuid,
            type: 'SCANNED',
          })

          targetClient.loginCondition.status++
          break
        case 1:
          res.json(genJson(null, '登录成功~'))
          sendData(targetClient, 'ok', {
            uuid,
            type: 'SUCCESS',
            token: generate(tokenData.userId),
          })

          targetClient.loginCondition.status++
          break
        default:
          res.json(genJson(null, '二维码已经失效~'))
          break
      }
      return
    }
  }

  res.json(genJson(null, '登录失败~'))
})

module.exports = app

function genJson(data = null, message = 'Success') {
  return {
    code: 200,
    message,
    data,
  }
}