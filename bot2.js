const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
var conn= 0;
var dispatcher = 0;
var receiver = 0;
var isjoined = false;

var mode = 0; 	//0 do nothing, lay dormant
		//1 play the sound when the user joins
		//3 play the sound when the user speaks

var punkd = "somerandomassusername";

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
		receiver = 0;
	}	
	if(message.content == "/play"){
		dispatcher = playSound();
	}
	if(message.content == "/stop"){
		if(dispatcher != 0){
			dispatcher.end();
		}
	}
	if(message.content.startsWith("/mode ")){
		var arr = message.content.split(" ");
		var tmp = arr[1];
		if(tmp > 3 || tmp < 0){
			message.channel.send("invalid mode");
			return;
		}
		mode = tmp;
	}
	if(message.content.startsWith("/punk ")){
		//Set punkd = username entered
		var arr = message.content.split(" ");
		punkd = arr[1];
		message.channel.send("Updated punkd to " + punkd);
	}
}

client.on('voiceStateUpdate', (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel
	let oldUserChannel = oldMember.voiceChannel

	 if(oldUserChannel === undefined && newUserChannel !== undefined) {
		//joined channel
		console.log("Someone has joined");
		if(mode == 2){
			if(newMember.user.username == punkd)dispatcher = playSound();
			else console.log("It wasn't " + punkd +", so lets keep quiet");
		}
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
			receiver = conn.createReceiver();
			conn.on('speaking', (user, speaking)=>{
				if(mode == 3){
					if(speaking){
						if(user.username == punkd){
							dispatcher = playSound();
						}
					}
				}
			});
		});

    	} else {
      		message.reply('You need to join a voice channel first!');
    	}
	}
	if(conn !== 0){
		handleCommand(message);
	}
	
});

client.login(Secrets.thesecret);
