const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");

console.log(Secrets.thesecret);

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  }
});

client.login("SuperSecretBotTokenHere");
