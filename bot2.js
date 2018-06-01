const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
var conn= 0;
var dispatcher = 0;
var isjoined = false;

function playSound(){
	if(conn != 0){
		return conn.playFile('/home/administrator/wow.mp3');
	}
}

client.on("ready", () => {
  console.log("I am ready!");
});


function handleCommand(message){
	if(message.content == "/leave"){
		conn.disconnect();
		conn= 0;	
	}	
	if(message.content == "/play"){
		dispatcher = playSound();
	}
	if(message.content == "/stop"){
		if(dispatcher != 0){
			dispatcher.end();
		}
	}
}

client.on('voiceStateUpdate', (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel
	let oldUserChannel = oldMember.voiceChannel

	 if(oldUserChannel === undefined && newUserChannel !== undefined) {
		//joined channel
		console.log("Someone has joined");
		playSound();

  	} else if(newUserChannel === undefined){
		//left channel
		console.log("Someone has left");
	}



});

client.on("message", (message) => {
  	console.log("working on message: " + message.content);
	
	if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    	if (message.member.voiceChannel) {
  		message.member.voiceChannel.join().then(connection => {
			conn = connection;
		});
		/*
			client.on("message", (message) =>{
				if(message.content == "/test") message.channel.send("this is a test");	
				if(message.content === "/leave") connection.disconnect();

			});  */		

    	} else {
      		message.reply('You need to join a voice channel first!');
    	}
	}
	if(conn !== 0){
		handleCommand(message);
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
