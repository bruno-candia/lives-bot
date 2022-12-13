const fetch = require('node-fetch');
const twitch = new ApiClient({ authProvider });
const { ApiClient } = require("twitch");
const { ClientCredentialsAuthProvider } = require("twitch-auth");
const {
  twitchClientId,
  twitchSecret,
} = require('./src/config/vars');

const authProvider = new ClientCredentialsAuthProvider(
  twitchClientId,
  twitchSecret
);

class Twitch {
  constructor({ clientId, secretId }) {
    this.clientId = clientId
    this.secretId = secretId
  }

  async sendOnline(event){
    const stream = await twitch.helix.streams.getStreamByUserId(
      event.broadcaster_user_id
    );
    const game = await stream.getGame();
    
    return {
      stream, 
      game
    }
    // const { messageId } = await courier.send({
    //   eventId: "TWITCH_ONLINE",
    //   recipientId: "AYDRIAN10036",
    //   profile: {
    //     phone_number: "+12025550140"
    //   },
    //   data: {stream, game}
    // });
    console.log(
      `Online notification for ${event.broadcaster_user_name} sent. Message ID: ${messageId}.`
    );
  };

}

module.exports = Twitch
