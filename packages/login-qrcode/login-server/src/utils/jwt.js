const jwt = require('jsonwebtoken')

const SECRET_KEY = 'SECRET_KEY'

const verify = (token, secret = SECRET_KEY) => {
  try {
    return jwt.verify(token, secret)
  } catch (e) {
    return false
  }
}

const generate = (uid, exp = 1000) => {
  return jwt.sign(
    {
      userId: uid,
    },
    SECRET_KEY,
    {
      expiresIn: exp,
    }
  )
}

module.exports = {
  verify,
  generate,
}
