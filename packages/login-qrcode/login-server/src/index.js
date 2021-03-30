// For the backend, we set the container's entryPoint to src/index.js

const app = require('./api')

const { createWss } = require('./ws')
const { initWebsocket } = require('./ws/socket')

require('./controller/login')


const port = 8080

app.listen(port, () => console.log(`Example backend API listening on port ${port}!`))

// websocket 初始化
const wss = createWss(app)
initWebsocket(wss)
