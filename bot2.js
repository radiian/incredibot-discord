const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
const fs = require('fs');

var settings = {
	punkd: "somerandomassusername",
	mode: "0",
	guild: "0"
};
var conn= 0;
var dispatcher = 0;
var receiver = 0;
var isjoined = false;
var guild = 0;

//var mode = 0; 	//0 do nothing, lay dormant
		//1 play the sound when the user joins
		//2 play the sound when the user speaks

//var punkd = "somerandomassusername";


function save(){
	fs.writeFile("./settings.json", JSON.stringify(settings), 'utf8', function (err){
	if(err){
		return console.log(err);
	}
	console.log("Settings were saved");
	});
}

function playSound(){
	if(conn != 0){
		//eventually want to change the nickname once the bot does its thing
		//not as easy as it seems though
		/*if(settings.guild){
			var me = guild.members.get(Secrets.botid);
			me.setNickname("Testy faggot").catch(console.error);
		}*/
		return conn.playFile('/home/administrator/incredible2s.mp3');
	}
}

client.on("ready", () => {
	//load the settings here
	if(fs.existsSync("./settings.json")){	
		var tmpset = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
		if(!tmpset) console.log("No settings file, using default");
		else {
			settings = tmpset;
		}
	}
	else {
		console.log("no settings file, saving the default");
		save();
	}
  	console.log("I am ready!");
});


function handleCommand(message){
	if(message.content == "$!guildme"){
		settings.guild = message.guild;
		message.react("👁");
		save();
	}
	if(message.content.startsWith("%guildeban")){
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
                                if(settings.mode == 2){
                                        if(speaking){
                                                if(user.username == settings.punkd){
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
	if(message.content == "$!leave"){
		if(conn != 0){
			conn.disconnect();
			conn= 0;	
			receiver = 0;
		}
	}	
	if(message.content.startsWith("$!incredible ") || message.content.startsWith("$!inc ")){
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
					}, 400);
				});
			});
		}
		else {
			//else join the caller's channel

		}
	}
	if(message.content == "$!play"){
		if(conn != 0){
			dispatcher = playSound();
		}
	}
	if(message.content == "$!stop"){
		if(conn != 0 && dispatcher != 0){
			dispatcher.end();
		}
	}
	if(message.content.startsWith("$!mode ")){
		var arr = message.content.split(" ");
		var tmp = arr[1];
		if(tmp > 2 || tmp < 0){
			message.channel.send("invalid mode");
			return;
		}
		settings.mode = tmp;
		message.react("💦");
		save();
	}
	if(message.content.startsWith("$!punk ")){
		//Set punkd = username entered
		var arr = message.content.split(" ");
		if(arr[1]){
			if(arr[1] != Secrets.founder){
				settings.punkd = arr[1];
				message.channel.send("Now waiting for " + settings.punkd);
				save();
			}
			else {
				message.channel.send("You cant prank the founder dumbass");
			}
		}
	}
}

client.on('voiceStateUpdate', (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel
	let oldUserChannel = oldMember.voiceChannel

	 if(oldUserChannel === undefined && newUserChannel !== undefined) {
		//joined channel
		console.log("Someone has joined");
		//currently if in mode 1 if the user joins it joins the channel to 
		//play the sound. It does not check to see if the user changes channels
		//which needs to be added.
		if(settings.mode == 1){
			if(newMember.user.username == settings.punkd){
				console.log("User joined! Lets do this!");
				if(!conn){
					console.log("Joining their channel");
					newMember.voiceChannel.join().then(connection => {
						conn = connection;
						dispatcher = playSound();
						dispatcher.on("end", function(){
							setTimeout(function(){
                                                		if(conn != 0) conn.disconnect();
                                                		conn = 0;
                                                		dispatcher = 0;
                                        		}, 400);


						});
					});
				
				}
				else {
					console.log("Playing the sound");
					dispatcher = playSound();
				}
				
			}
			else console.log("It wasn't " + settings.punkd +", so lets keep quiet");
		}
  	} else if(newUserChannel === undefined){
		//left channel
		console.log("Someone has left");
	}



});

client.on("message", (message) => {
  	console.log("working on message: " + message.content);
	
	if (message.content === '$!join') {
    // Only try to join the sender's voice channel if they are in one themselves
    	if (message.member.voiceChannel) {
  		message.member.voiceChannel.join().then(connection => {
			conn = connection;
			receiver = conn.createReceiver();
			conn.on('speaking', (user, speaking)=>{
				if(settings.mode == 2){
					if(speaking){
						if(user.username == settings.punkd){
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
