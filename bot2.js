const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
var conn= 0;
var dispatcher = 0;
var receiver = 0;
var isjoined = false;

var mode = 0; 	//0 do nothing, lay dormant
		//1 play the sound when the user joins
		//2 play the sound when the user speaks

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
	if(message.content.startsWith("/guild")){
		var arg = message.content.split(" "); 
		//console.log(message.guild.channels);
		var guild = message.guild;
		//var chan = guild.channels.find("name", "test");
		var voiceChans = guild.channels.filter(c =>c.type == "voice");
		if(!arg[1]){
			message.channel.send("No channel???!!!");
			return;
		}
		
		var chan = voiceChans.find("name", arg[1]);
		console.log("Guild: " + guild);
		console.log("Chan: ");
		console.log(voiceChans);
		if(chan){
			chan.join().then(connection => {
       	                conn = connection;
                        receiver = conn.createReceiver();
                        
				conn.on('speaking', (user, speaking)=>{
                                if(mode == 2){
                                        if(speaking){
                                                if(user.username == punkd){
                                                        dispatcher = playSound();
                                                }
                                        }
                                }
                        });
                });	
		}
		else {
			message.channel.send("Couldnt find that channel dave");
		}
	}
	if(message.content == "/leave"){
		if(conn != 0){
			conn.disconnect();
			conn= 0;	
			receiver = 0;
		}
	}	
	if(message.content.startsWith("/incredible ")){
		var arg = message.content.split(" ");
		if(arg[1]){
			//Try to join the channel named in the second argument
			var guild = message.guild;
                	var voiceChans = guild.channels.filter(c =>c.type == "voice");
			var chan = voiceChans.find("name", arg[1]);
			if(conn){
				message.channel.send("I'm arleady in a channel you twat");
				return;
			}
			chan.join().then(connection =>{
				conn = connection;
				dispatcher = playSound();
				dispatcher.on("end", function(){
					setTimeout(function(){
						if(conn != 0) conn.disconnect();
						conn = 0;
						dispatcher = 0;
					}, 4000);
				});
			});
		}
		else {
			//else join the caller's channel

		}
	}
	if(message.content == "/play"){
		if(conn != 0){
			if(dispatcher != 0) dispatcher = playSound();
		}
	}
	if(message.content == "/stop"){
		if(conn != 0 && dispatcher != 0){
			dispatcher.end();
		}
	}
	if(message.content.startsWith("/mode ")){
		var arr = message.content.split(" ");
		var tmp = arr[1];
		if(tmp > 2 || tmp < 0){
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
		if(mode == 1){
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
				if(mode == 2){
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
	else {
		handleCommand(message);
	}
	
	
});

client.login(Secrets.thesecret);
