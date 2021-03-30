import { useRef, useState, useCallback, useMemo } from 'react'

import './App.css'

function App() {
  const [userToken, setUserToken] = useState('')
  const [uuid, setUuid] = useState('')

  const loginByUsername = useCallback(() => {
    fetch('http://localhost:8080/login/token')
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        if (res.code === 200) {
          setUserToken(res.data.token)
        }
      })
  }, [])

  const scanQrcode = useCallback(() => {
    fetch('http://localhost:8080/login/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uuid,
        token: userToken,
      }),
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        console.log(res)
      })
  }, [uuid, userToken])

  const confirmLogin = useCallback(() => {
    fetch('http://localhost:8080/login/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uuid,
        token: userToken,
      }),
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        console.log(res)
      })
  }, [uuid, userToken])

  return (
    <div className="App">
      <h3>Step 1 手机登录</h3>
      <h4>手机必须处于登录状态，这里我们会向服务端请求一个 TOKEN，拿到 TOKEN 则代表登录成功</h4>
      <button onClick={loginByUsername}>获取 TOKEN（模拟手机登录）</button>

      {userToken ? (
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
      ) : null}

      <h3>Step 2 模拟扫码操作</h3>
      <h4>这里请输入二维码界面显示的 UUID，省去了手机扫码，将二维码转换成 uuid 的步骤</h4>
      <div>
        <input
          value={uuid}
          // c7fcca58-6831-4761-a8ef-d43b5a5888df
          onChange={(event) => {
            console.log(event);
            const value = event.target.value
            setUuid(value)
          }}
          style={{ width: '50%', marginBottom: 12 }}
          placeholder="请输入控制台暴露的的 uuid"
        />
      </div>
      <button onClick={scanQrcode}>模拟扫码操作</button>

      <h3>Step 3 执行确认操作</h3>
      <h4>在扫码成功时，变为等待确认登录状态，点击下面按钮则登录成功</h4>
      <button onClick={confirmLogin}>确认登录</button>
    </div>
  )
}

export default App
