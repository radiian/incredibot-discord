const Discord = require("discord.js");
const client = new Discord.Client();
const Secrets = require("./supersecrets.js");
const fs = require('fs');

var settings = {
	punkd: "somerandomassusername",
	mode: "0",
	guildid: "0",
	guild: "0",
	nick: "BotBoiJenkins"
};

var conn= 0;
var dispatcher = 0;
var receiver = 0;
var isjoined = false;
var guild = 0;
var newNicks = [
	"Testy faggot",
	"Brandon's Tiny Dick",
	"LitBot",
	"Memey Boi",
	"Meme Review",
	"✊🍆💦",
	"Incredibot",
	"Zech is gay",
	"wow",
	"Pewds",
	"Halo sucks",
	"bigus dickus" ];

//var mode = 0; 	//0 do nothing, lay dormant
		//1 play the sound when the user joins
		//2 play the sound when the user speaks

//var punkd = "somerandomassusername";
function randomName(oldNick){
	var index = Math.floor(Math.random() * newNicks.length); 
	var newNick = newNicks[index];
	while(newNick == oldNick){
		index = Math.floor(Math.random() * newNicks.length);
		newNick = newNicks[index];
	}
	console.log("New random name: " + newNick);
	//settings.nick = newNick;
	//save();
	return newNick;
}


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

function changeNick(newNick){
	if(settings.guild){
		//console.log(settings.guild);
		//console.log(settings.guild.members);
		try{
			var members = settings.guild.fetchMembers();
			var me = settings.guild.members.get(Secrets.botid);
			me.setNickname(newNick).then(function(){
			//console.log("did it work???")
				settings.nick = newNick;
				save();
			})
			.catch(function() { 
				logError(console.error);
				console.log("Chang nickname is fucked up"); 
				console.log(console.error);
			});
		}
		catch{
			console.log("Changing nick names is fucking up");
		}
	}
}

function discon(){
	if(conn != 0) conn.disconnect();
	conn = 0;
	dispatcher = 0;
	changeNick(randomName(settings.nick));
}

function logError(errorMessage){
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth();
	var day = now.getDate();
	
	var hour = now.getHours();
	var minute = now.getMinutes();

	var filename = "errorlog-"+year+month+day+".log";
	var line = hour + ":" + minute + "; " + errorMessage + "\r\n";

	//if(!fs.existsSync("./"+filename)){
		//create the log file
	//}
	
	fs.appendFile(filename, line, function(err){
		if(err){
			console.log("We tried to log an error but it gave an error!");
			console.log(console.error);
		}
	});	
	//open the file
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
		logError("No settings file was found, setting up the default file");
		console.log("no settings file, saving the default");
		save();
	}

	if(settings.guildid != "0"){
		var guildFind = client.guilds.get(settings.guildid);
		if(!guildFind){
			logError("The saved guild does not exist in the client guild list");
			console.log("Couldn't find that guild dave");
		}
		else settings.guild = guildFind;
	}
  	console.log("I am ready!");
});


function handleCommand(message){
	if(!message.content.startsWith("$!")) return;	//If it's not a command then fuck off
	//else console.log("Working on command: " + message);
	if(message.content == "$!dbg"){
		console.log(settings);

	}
	if(message.content.startsWith("$!log ")){
		 var arg = message.content.split(" ");
		var msg = "";
		for(var i = 0; i < arg.length - 1; ++i){
			msg += arg[i+1] + " ";
		}
		logError(msg);
	}
	if(message.content == "$!who"){
		changeNick("incredibot");	
	}
	if(message.content == "$!name"){
		var oldNick = settings.nick;
		settings.nick = randomName(oldNick);
	}
	if(message.content == "$!guildme"){
		//We only want to save the guild ID, not the whole guild
		//This is because of the way guilds are put into JSON
		//They cannot be stringified and have all the data saved
		//so instead we will only save the guild ID, and then fetch the guild by id at start
		/*console.log("Applying guild");
		console.log(message.guild);
		console.log("\r\n\r\nSettings.Guild:");
		settings.guild = message.guild;
		console.log(settings.guild);*/
		console.log("Saving guild id: ");
		console.log(message.guild.id);
		settings.guildid = message.guild.id;
		settings.guild = message.guild;
		message.react("👁");
		save();
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
			//This is really important because without it we crash
			if(chan)chan.join().then(connection =>{
				conn = connection;
				dispatcher = playSound();
				dispatcher.on("end",discon); 
			});
			else message.channel.send("Y u no in voice channel????");
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
		//console.log("Someone has joined");
		//currently if in mode 1 if the user joins it joins the channel to 
		//play the sound. It does not check to see if the user changes channels
		//which needs to be added.
		if(settings.mode == 1){
			if(newMember.user.username.toLowerCase() == settings.punkd.toLowerCase()){
				console.log("User joined! Lets do this!");
				if(!conn){
					console.log("Joining their channel");
					newMember.voiceChannel.join().then(connection => {
						conn = connection;
						dispatcher = playSound();
						dispatcher.on("end",discon);


					});
				
				}
				else {
					//console.log("Playing the sound");
					dispatcher = playSound();
				}
				
			}
			else console.log("It wasn't " + settings.punkd +", so lets keep quiet");
		}
  	} else if(newUserChannel === undefined){
		//left channel
		//console.log("Someone has left");
	}



});

client.on("message", (message) => {
  	//console.log("working on message: " + message.content);
	

	//I think all of this can be moved into the handleCommand() function
	if (message.content === '$!join') {
    // Only try to join the sender's voice channel if they are in one themselves
    	if (message.member.voiceChannel) {
  		message.member.voiceChannel.join().then(connection => {
			conn = connection;
			receiver = conn.createReceiver();
			conn.on('speaking', (user, speaking)=>{
				if(settings.mode == 2){
					if(speaking){
						if(user.username.toLower() == settings.punkd.toLower()){
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
