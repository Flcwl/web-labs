require('dotenv').config()

const path = require('path') 
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const assetPath = path.join(__dirname, '../assets/')
const app = express()

app.use(cors())
app.use('/static', express.static(assetPath))
app.use(bodyParser.json())

console.log(__dirname, assetPath);
module.exports = app
