import { useRef, useState, useCallback, useMemo } from 'react'
import './App.css'

const qrcodeLoginStatusEnum = {
  UNSET: 1,
  SHOW_QRCODE: 2, // 请求，获取、展示二维码
  SCANNED_QRCODE: 3, // 已扫描二维码，等待确认状态
  SUCCESS_LOGIN: 4, // 确认登录，登录成功
  FAILURE_LOGIN: 5, // 登录失败
}

function App() {
  const [qRCodeLoginStatus, setQRCodeLoginStatus] = useState(qrcodeLoginStatusEnum.UNSET)
  const [qRCode, setQRCode] = useState({
    codeId: '',
    qrImage: '',
  })
  const codeWebsocketRef = useRef(null)
  const [userToken, setUserToken] = useState('')

  const showQrCode = useCallback(() => {
    setQRCodeLoginStatus(qrcodeLoginStatusEnum.SHOW_QRCODE)
  }, [])

  const scannedQrCode = useCallback(() => {
    setQRCodeLoginStatus(qrcodeLoginStatusEnum.SCANNED_QRCODE)
  }, [])

  const loginSuccess = useCallback((res) => {
    setUserToken(res.data.token)
    setQRCodeLoginStatus(qrcodeLoginStatusEnum.SUCCESS_LOGIN)
    codeWebsocketRef.current.close()
  }, [])

  // websocket 消息处理
  const messageHandler = useMemo(() => {
    return {
      // 二维码登录准备 ok
      SHOW_QR_CODE: showQrCode,
      // 二维码被扫描，等待客户端确认
      SCANNED_QR_CODE: scannedQrCode,
      // 登录成功，拿到 userToken
      LOGIN_SUCCESS: loginSuccess,
    }
  }, [showQrCode, scannedQrCode, loginSuccess])

  const setupSocket = useCallback(
    (codeId) => {
      let codeWebsocket = codeWebsocketRef.current

      if (codeWebsocket) {
        codeWebsocket.close()
      }

      // 建立 websocket 服务
      codeWebsocket = new WebSocket('ws://localhost:8081')
      codeWebsocketRef.current = codeWebsocket

      codeWebsocket.onmessage = (e) => {
        const res = JSON.parse(e.data)
        console.log('Websocket:', res)
        messageHandler[res.data.type]?.(res)
      }

      // 连接建立成功
      codeWebsocket.onopen = () => {
        const msg = genWsData('START_LOGIN', {
          uuid: codeId,
        })
        codeWebsocket.send(msg)
      }
    },
    [messageHandler]
  )

  const getQrCode = useCallback(() => {
    fetch('http://localhost:8080/login/qrcode')
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        if (res.code === 200) {
          setQRCode(res.data)
          setupSocket(res.data.codeId)
        }
      })
  }, [setupSocket])

  return (
    <div className="App">
      <h1>扫码登录测试</h1>
      <div>
        <button
          onClick={() => {
            getQrCode()
          }}
        >
          点我唤起扫码框
        </button>
        {(() => {
          switch (qRCodeLoginStatus) {
            case qrcodeLoginStatusEnum.UNSET:
              return null
            case qrcodeLoginStatusEnum.SHOW_QRCODE:
              return (
                <div>
                  <img src={qRCode.qrImage} alt="code" />
                </div>
              )
            case qrcodeLoginStatusEnum.SCANNED_QRCODE:
              return (
                <div>
                  <div>扫描成功，请在手机端继续操作，点击确认按钮以登录</div>
                </div>
              )
            case qrcodeLoginStatusEnum.SUCCESS_LOGIN:
              return (
                <div>
                  <div>恭喜，登录成功~</div>
                  <div>
                    <p
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: '10px 40px',
                        boxSizing: 'border-box',
                        wordBreak: 'break-all',
                      }}
                    >
                      {userToken}
                    </p>
                  </div>
                </div>
              )
            default:
              return (
                <div>
                  <div>登录失败，请稍后重试</div>
                </div>
              )
          }
        })()}
      </div>
    </div>
  )
}

function genWsData(type, data) {
  const _data = {
    type,
    data,
  }

  return JSON.stringify(_data)
}

export default App
