const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
var connection;

var isjoined = false;

function playSound(conn){
	conn.playFile('/home/administrator/wow.mp3');
}

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", (message) => {
  	console.log("working on message: " + message.content);

	if (message.content.startsWith("!start")) {
  		message.channel.send("Fucking it up");
  	}
  	if (message.content.startsWith("!stop")){
		message.channel.send("Done now");
	}
	if(message.content === '/play'){
		console.log(connection.status);
		if(isjoined) connection.playFile("/home/administrator/wow.mp3");		
	}
	if (message.content === '/leave'){
		if(connection)connection.disconnect() ;

	}
	if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    	if (message.member.voiceChannel) {
	
  		message.member.voiceChannel.join().then(connection => {
  			const dispatcher = connection.playFile('/home/pi/wow.mp3');
  		}).catch(console.error);
    	} else {
      		message.reply('You need to join a voice channel first!');
    	}
	}
});

client.login(Secrets.thesecret);
/*client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel


  if(oldUserChannel === undefined && newUserChannel !== undefined) {

     guildObj.defaultChannel.send("Greetings!");

  } else if(newUserChannel === undefined){

    guildObj.defaultChannel.send("Hey fuck off!");

  }
})*/
