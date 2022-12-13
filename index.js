const express = require("express");
const crypto = require("crypto");
const { ApiClient } = require("twitch");
const { ClientCredentialsAuthProvider } = require("twitch-auth");

const port = process.env.PORT || 3000;
const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;

const authProvider = new ClientCredentialsAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);

const app = express();
const twitch = new ApiClient({ authProvider });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const verifyTwitchSignature = (req, res, buf, encoding) => {
  const messageId = req.header("Twitch-Eventsub-Message-Id");
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
  const messageSignature = req.header("Twitch-Eventsub-Message-Signature");
  const time = Math.floor(new Date().getTime() / 1000);
  console.log(`Message ${messageId} Signature: `, messageSignature);

  if (Math.abs(time - timestamp) > 600) {
    // needs to be < 10 minutes
    console.log(
      `Verification Failed: timestamp > 10 minutes. Message Id: ${messageId}.`
    );
    throw new Error("Ignore this request.");
  }

  if (!twitchSigningSecret) {
    console.log(`Twitch signing secret is empty.`);
    throw new Error("Twitch signing secret is empty.");
  }

  const computedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", twitchSigningSecret)
      .update(messageId + timestamp + buf)
      .digest("hex");
  console.log(`Message ${messageId} Computed Signature: `, computedSignature);

  if (messageSignature !== computedSignature) {
    throw new Error("Invalid signature.");
  } else {
    console.log("Verification successful");
  }
};

app.use(express.json({ verify: verifyTwitchSignature }));

app.post("/webhooks/callback", async (req, res) => {
  const messageType = req.header("Twitch-Eventsub-Message-Type");
  if (messageType === "webhook_callback_verification") {
    console.log("Verifying Webhook");
    return res.status(200).send(req.body.challenge);
  }

  const { type } = req.body.subscription;
  const { event } = req.body;

  console.log(
    `Receiving ${type} request for ${event.broadcaster_user_name}: `,
    event
  );

  if (type === "stream.online") {
    try {
      sendOnline(event);
    } catch (ex) {
      console.log(
        `An error occurred sending the Online notification for ${event.broadcaster_user_name}: `,
        ex
      );
    }
  }

  res.status(200).end();
});

const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});