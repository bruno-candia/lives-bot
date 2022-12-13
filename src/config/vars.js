const fs = require('fs')
const { join } = require('path')

require('dotenv-safe').config({
  example: join(__dirname, '..', '..', '.env.example'),
  path: join(__dirname, '..', '..', '.env'),
})

module.exports = {
  twitchClientId: process.env.TWITCH_CLIENT_ID,
  twitchSecret: process.env.TWITCH_CLIENT_SECRET,
  twitchSigningSecret: process.env.TWITCH_SIGNING_SECRET,
  appPort: process.env.PORT
}
