// [console]
// Instacash 2018
// - scottie

var config = require("./config"); // config file config.js

console.log(config);
var serverName = config.serverName; //Server Name of Main Server.
var welcomeChanID = config.welcomeChanID; //ID of  #welcome (For posting welcome message / help message to new users).
var welcomeChanName = config.welcomeChanName; // Name of #welcome chan, see above.
var logChanID = config.logChanID; // ID for the log channle ie: #staff-log
var mainBotName = config.mainBotName; //ie: 
var badSpamWord = config.badSpamWord; //Any discord invite url
var realBotDiscordToken = config.realBotDiscordToken;
var githubWebhookSecret = config.githubWebhookSecret;
var githubWebhookPort = config.githubWebhookPort; // port for the webhook from github
var devChatID = config.devChatID; // #dev room for github event posting, setup webhook for this in github settings...
var twitterUserName = config.twitterUserName;
var tickerURL = config.tickerURL;
var infourl = config.infourl; // url for info and helps stuff, ie: welcome 
var blockexplorerURL = config.blockexplorerURL;
var twitterConsumerKey = config.twitterConsumerKey;
var tiwtterConsumerSecret = config.tiwtterConsumerSecret;
//Instacash wallet and tip bot
var RPCip = config.RPCip;
var RPCport= config.RPCport
var RPCpass = config.RPCpass;
var RPCuser = config.RPCuser;
var lastestVersion = "v1.2";
//github chan 411029890608005121
var helpfile = "https://raw.githubusercontent.com/insta-cash/instacash-discord-bot/master/README.md";

//https://discordapp.com/oauth2/authorize?client_id=&scope=bot&permissions=515136
const JSON = require('circular-json');
var coind = require('coind-client');
const msgEmbedToRich = require("discordjs-embed-converter");
var _ = require('lodash');
var anti_spam = require("discord-anti-spam"); //anitspam
var Twitter = require('twitter');
const getBearerToken = require('get-twitter-bearer-token');
var fs = require('fs');
var request = require('request');
const Discord = require('discord.js');//https://discordjs.readthedocs.io/en/latest/docs_client.html
const client2 = new Discord.Client(); //our bot
var hand = fs.readFileSync('./hand.png');
var whale = fs.readFileSync('./whale.png');
var hand = new Buffer(hand).toString('base64');
var whale = new Buffer(whale).toString('base64');
var externalip = require("externalip");
const WebhooksApi = require('@octokit/webhooks')
const webhooks = new WebhooksApi({
  secret: githubWebhookSecret
})

var client = new coind.Client({
  host: RPCip,
  port: RPCport,
  user: RPCuser,
  pass: RPCpass
});




//last tweet
function lastTweet(callback){
  const twitter_consumer_key = twitterConsumerKey;
  const twitter_consumer_secret = tiwtterConsumerSecret;
  getBearerToken(twitter_consumer_key, twitter_consumer_secret, (err, res) => {
    if (err) {
      // handle error 
      console.log("[TWITTER]: Error" + err);
    } else {   
      //console.log(res.body.access_token);
      // bearer token 
      //twitter config
      var client = new Twitter({
        consumer_key: twitterConsumerKey,
        consumer_secret: tiwtterConsumerSecret,
        bearer_token: res.body.access_token
      });
      var params = {screen_name: twitterUserName};
      client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
          return(callback(tweets[0].text));
        }else{
          return(callback("Error, connecting to twitter server."));
        }
      });
    }
  })
}

//Config options for anti spam
anti_spam(client2, {
  warnBuffer: 4, //Maximum amount of messages allowed to send in the interval time before getting warned. 
  maxBuffer: 7, // Maximum amount of messages allowed to send in the interval time before getting banned. 
  interval: 1000, // Amount of time in ms users can send a maximum of the maxBuffer variable before getting banned. 
  warningMessage: "stop spamming please ....", // Warning message send to the user indicating they are going to fast. 
  banMessage: "has been banned for spamming, anyone else wanna try me ??", // Ban message, always tags the banned user in front of it. 
  maxDuplicatesWarning:7, // Maximum amount of duplicate messages a user can send in a timespan before getting warned 
  maxDuplicatesBan:10 // Maximum amount of duplicate messages a user can send in a timespan before getting banned 
});

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
//ticker function for ticker command
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
function ticker(callback){
    request(tickerURL, function (error, response, body) {
      if(error){
        console.log('error:', error); // Print the error if one occurred
      }

      if(!error && response.statusCode){
        var jsonObject = JSON.parse(body);
        console.log("[Price Check]: " + jsonObject.ticker.last);
        return(callback({success:true, data:jsonObject.ticker}));
        
        // Graviex.net
        /*	
        at	1521113992
          ticker	
              buy	"0.000003612"
              sell	"0.00000641"
              low	"0.000003603"
              high	"0.000004011"
              last	"0.000003603"
              vol	"2329.893"
              volbtc	"0.0085498958135"
              change	"-0.099024756"
          */

      }else{
        return(callback({success:false, body:"Error connecting to exchange, maybe its down :( "}));
      }
     
    });
}

//the robot (botapp)
client2.on('ready', () => {
  console.log('robotbot - Connected to Discord Server....');
});

//on client 2 guildMemberAdd Event
client2.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', welcomeChanName);
    // Do nothing if the channel wasn't found on this server
    if (!channel){
      return;
    }
    if( member.guild.name == serverName){
      client2.channels.get(welcomeChanID).send("👋 Welcome to the server "+ member + " please see " + infourl + ", enjoy !"); //send to specific chan
      console.log("WELCOME: " +  member.displayName  + " to " + member.guild); 
    }
  });


//on client2 message event (captures all messages on server on all channels)
client2.on('message', function(message) {
    try{
       var time = new Date().toISOString().replace(/\..+/, '').split("T"[1]);
       var lotIt = "[" + time + "] " + message.author.username  + ": " + message.content;
       //"[" + message.author.email + "]"

       try{       
            if( message.guild.name == serverName){ // server-logs
              //console.log(message.channel);//
              if(message.channel.id == logChanID){ //stop for welcome, log, signal-log, signal-scanner channle
                //stop double post in logs
              }else{
                //console.log("Server-Logs: " + message.content);
                //client.user.setNickname({nick:"✏️📋"});
                //client.user.setAvatar('./hand.png');
                client2.channels.get(logChanID).send("``` 📣" + lotIt + " | Spam Rating: " + "0.1%" + "```"); //send to specific channle
                //client.user.setAvatar('./whale.png');
                //Client.user.setNickname({nick:"🐳🐋"});
              } 
              
              //some basic anti spam for now...
              if(message.content.indexOf(badSpamWord) > -1) {   
                if(message.author.username != mainBotName || "console"){                  
                  //kick user
                  console.log("SPAMER FOUND:");
                  var kickedmember = message.channel.server.members.get("id", message.author.id);
                  //console.log(kickedmember);
                  kickedmember.kick("kicked for spam / advertising", function(d){
                      console.log(d);                    
                      client2.channels.get(message.channel.id).send("```[👢KICKED] "+message.author.username +" for Advertising / Spam, next time it will be a BAN.```");
                      console.log("👢" + "User: " + message.author.username + " has been kicked for spam !!! see above message !! AUTO SPAM BOT ENGAGE" + " | Spam Rating: " + "50%");
                  });
                 
                }
                
              }

            }

      }catch(e){
        //console.log(e);
        console.log("[Private Message Received] " + message.channel.id);
      }
   
    }catch(e){
        //console.log(message.author.username + ": " + message.content);
        //console.log(message.author.username + "@" + message.author + ' sent message in channle, ' + message.channel);
        console.log(e);
    }
  });

  //When typing starts on client or client2
  client2.on('typingStart', function(channel, user) {
    //console.log(user.username + '  is typing in  ' + channel.name + " in chan ID " + channel.id);
    
  });

  
// client 2 on message again, this is used for commands to keep everything clean
client2.on('message', function(message) {

 // if(message.guild.name == serverName){
    console.log(serverName + ": " + message.content);
    
    if (message.content.split(" ")[0] === '!explore' || message.content.split(" ")[0] === '!explorer') {
      if(message.content.split(" ")[1] != null){ //ie: getinfo getdifficulty getconnectioncount getblockcount getblockhash?index=1337 getblock?hash=14a7cf4e29e2bf812baf67d507c6ae9083019f2626c6e9b0bb61c945007d5cc8
        //getnetworkhashps getbalance/AWQFaw6QZXkz3Yor2GiFkeKDU88fKFtvbP
        //console.log(message.content.split(" ")[1]);
        request(blockexplorerURL+"/api/" + message.content.split(" ")[1], function (error, response, body) {
          if(error){
            console.log('error:', error); // Print the error if one occurred
          }else{     

            //no error
            console.log(body);
            //var jsonObject = JSON.parse(body);
            //console.log(jsonObject);
            var string = body.replace(/}/g,"");
            string = string.replace(/{/g,"");
            message.reply("```" + string + "```");
          }
        });
      };
    }

    if (message.content.split(" ")[0] === '!download') {
      message.reply("```Latest Version: "+ lastestVersion +" ``` ");
      message.reply("```❗️❗️❗️ Remember to stay up to date:``` https://github.com/insta-cash/instacash/releases/latest");
    }
    
    if (message.content.split(" ")[0] === '!lol') {
      
      //random joke
      //!joke
      request("http://api.icndb.com/jokes/random?firstName=Instacash", function (error, response, body) {
        var joke;
        if(error && body){
          message.reply("🛑Error: \n ```Quote server down or something, tell someone important, thanks...```");
        }else{
          var json = JSON.parse(body);
          console.log(json.type);
          if(json.type == "success"){
              joke = json.value.joke.replace("Norris","").replace("his","it's");
              joke = joke.replace("  "," ");
              joke = "```🙃😂\n" + joke + "......```";
          }
          else{
              joke = "you are not funny..."
          }
          message.reply(joke);
          return;
        }
     });


  }

    if (message.content.split(" ")[0] === '!ticker') {
      
        ticker(function(d){
          if(d.success){
            message.reply("```📉📊📈 https://graviex.net \n" + 
            "🗠Base Volume: " + d.data.volbtc + "\n"
            + "🗠24h High: " + d.data.high + "\n" +
            "🗠24h Low: " + d.data.low + "\n" +
            "🗠Change: " + d.data.change+ "\n" +       
            "🗠Last: " + d.data.last + "```"); 
          }else{
            message.reply(d.data);
            return;
          }          
       });


    }

    //if(message.channel.id == delegatesChanID){ //#Delegates 
      try{
          //help command holding place
          if (message.content.split(" ")[0] === '!help') {
            message.reply(infourl + "\n" + " 📚  Bot Commands: https://github.com/insta-cash/instacash-discord-bot/blob/master/README.md");
            request(helpfile, function (error, response, body) {
              if(!error){
                message.reply(body.split("## Spam Filter")[0].replace(/##/g,"💡"));
              }
            });
            return;
          }

           
          if (message.content.split(" ")[0] === '!rain') {
            
              if(message.content.split(" ")[1] == "help"){

                message.reply("📚 Help: \n 💦💧rains some ICH on some random people, make it rain baby, show who is the 🐋🐳 \n ```Check your your syntax: !rain <people amount> <ICH amount>\nie: !rain 10 10```");
                return;
              }

              if(message.content.split(" ")[1] == undefined || message.content.split(" ")[2] == undefined){
                message.reply("🛑Error: \n ```Check your your syntax: !rain random <people amount> <ich amount>\nie: !rain 10 10```");
                return;
              }

              message.reply("🌧️💦💧🌧️💦💧🌧️💦💧🌧️💦💧🌧️💦💧");

              //server.members
              return;
            }
            //server.members
            //!rain 3 100
            //!rain <how many> <amount>
            //randomly send this many people this much each   

          
          if (message.content.split(" ")[0] === '!tip') {
            //!tip <userid> amount

            if(message.content.split(" ")[1] == "help"){
              message.reply("📚 Help: \n 💁 Sends some ICH to a user based on there user ID, tip them... cmon spread that 💖..\n ```!tip <user ID> <amount>\nie: !tip 211492100485808130 100\n how to get USR ID: https://i.imgur.com/BYe1ZOm.png```");
              return;
            }
            if(message.content.split(" ")[1] == undefined || message.content.split(" ")[2] == undefined){
              message.reply("🛑Error: \n ```Check your your syntax, something is wrong...\n ```!tip <user ID> <amount>\nie: !tip 211492100485808130 100\n how to get USR ID: https://i.imgur.com/BYe1ZOm.png```");
              return;
              //message.reply("Info to come...");
            }

            if(!Number.isInteger(message.content.split(" ")[1])){
              message.reply("🛑Error: \n ```Check your your syntax, \n ```!tip <user ID> <amount>\nie: !tip 211492100485808130 100\n how to get USR ID: https://i.imgur.com/BYe1ZOm.png```");
              return;
            }

            var toname = message.content.split(" ")[1];
            var amount = message.content.split(" ")[2];
            
            if(toname !=  undefined){
              if(amount != undefined){
                var id = message.author.id;
                console.log(id);
                var toId = toname;
                //var name = toname;
                //var toId = client2.users.get("name", to).id;
                console.log(toId);
                //console.log(message.author.username);
                
                console.log(message.author.avatarURL);
                //console.log(message.author.getNickname(message.channel.server));

                client.cmd('getbalance', id, function(error, balance) { 
                  if (!error){
                    if(amount == 0){
                      message.reply("[🛑Error] You cant send 0, dont be silly ...]");
                    }
                    if(balance >= amount){
                      message.reply("[💰Sending] You have enough ICH... ]");
                      message.reply("<@"+toId+"> " + message.author.username + " just sent you a 🎇TIP🎇 !!");
                    }else{
                      message.reply("[🛑Error] You dont have enough ICH ...]");
                    }
                    return;
                  }else{
                    message.reply("🛑Error: \n ```Check your balance, you broke....");
                    return;
                  }
                });
            } 

            }

          }
  
          if (message.content.split(" ")[0] === '!wallet') {
            if(message.content.split(" ")[1] == undefined){
              message.reply("🛑Error: \n ```Check your balance or check your syntax, something is wrong...```");
              return;
              //message.reply("Info to come...");
            }

            if(message.content.split(" ")[1] == "help"){
              var helptxt = "[HELP]\n " +
              "📚 Syntax: !wallet <COMMAND> \n " +
              "📚 IE: !wallet deposit \n" +
              "📚 Commands: \n" +
              "```deposit (or address), balance, send```";
              message.reply(helptxt);
              return;
            }   

            if(message.content.split(" ")[1] == "deposit" || message.content.split(" ")[1] == "address"){
              var id = message.author.id;
              var username = message.author.username;
              client.cmd('getaddressesbyaccount', id, function(error, address) { 
                if (!error){
                  if(address[0] == null){
                    message.reply("You are new here, please remember this is not 100% tested only store small amounts here you can risk...\n Generating new Deposit Adress...");
                    client.cmd('getnewaddress', id, function(error, address) { 
                      if (!error){
                         cmessage.reply("💰👛 Deposit Address: \n```" + address + "```");
                        return
                      }else{
                        console.log(error);
                        return;
                      }
                    });
                  }
                  message.reply("💰👛 Deposit Address: \n```" + address + "```");
                  return
                }else{
                  console.log(error);
                  return;
                }
              })
            }   
            
            if(message.content.split(" ")[1] == "balance"){
                var id = message.author.id;
                client.cmd('getbalance', id, function(error, balance) { 
                  if (!error){
                    message.reply("💰👛 Balance: " + "\n```" + balance + "```");
                    return;
                  }else{
                    console.log(error);
                    return;
                  }
                });
              
            } 

            if(message.content.split(" ")[1] == "send"){
              var amount = message.content.split(" ")[2]
              var to = message.content.split(" ")[3]
              if(amount == undefined || to == undefined){
                message.reply("🛑Bad syntax try: \n ```!wallet send ATP9fJjefZjt5zadw6Zsu4znDsqH7nRX3K 10```");
                return;
              }
              client.cmd('sendfrom', id, amount, function(error, address) { 
                if (!error){
                  if(address[0] == undefined){
                    message.reply("🛑Error: \n ```Check your balance or check your syntax, something is wrong...```");
                  }
                }else{
                  message.reply("🛑Error: \n ```Check your balance or check your syntax, something is wrong...```");
                }
              });
            }  


          }

         

          // just a test command for example
          if (message.content.split(" ")[0] === '!test') {
            console.log("Test Command Run..");
            const embed = new Discord.RichEmbed()
            .setTitle("This is your title, it can hold 256 characters")
            .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png")
            /*
             * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
             */
            .setColor(0x00AE86)
            .setDescription("This is the main body of text, it can hold 2048 characters.")
            .setFooter("This is the footer text, it can hold 2048 characters", "http://i.imgur.com/w1vhFSR.png")
            .setImage("http://i.imgur.com/yVpymuV.png")
            .setThumbnail("http://i.imgur.com/p2qNFag.png")
            /*
             * Takes a Date object, defaults to current date.
             */
            .setTimestamp()
            .setURL("https://discord.js.org/#/docs/main/indev/class/RichEmbed")
            .addField("This is a field title, it can hold 256 characters",
              "This is a field value, it can hold 2048 characters.")
            /*
             * Inline fields may not display as inline if the thumbnail and/or image is too big.
             */
            .addField("Inline Field", "They can also be inline.", true)
            /*
             * Blank field, useful to create some space.
             */
            .addBlankField(true)
            .addField("Inline Field 3", "You can have a maximum of 25 fields.", true);
          
            client2.channels.get("402331892474576906").send({embed});
            //or message.reply()???
          }

          if (message.content.split(" ")[0] === '!news') {
            lastTweet(function(d){
              message.reply("```" + d + "```");
            });
          }

      }catch(e){
        //down
        console.log("ERROR! " + e);
      }
     
   // }
 // }

  });


// THE real bot, the main bot from discord that does all the talking and listening in main server
client2.login(realBotDiscordToken, function(error, token){//robot poster
  if(!error){
      console.log(token);
  }else{
      console.log(error);
  }
});

// github webhook even listener
webhooks.on('*', ({id, name, payload}) => {
  console.log("[GITHUB] event received " + name);
  if(id != null){
    if(name == "undefined"){
      return;
    }
    //ping event
    if(name == "ping"){
      console.log("[GITHUB] Ping....");
      client2.channels.get(devChatID).send("[GITHUB] Ping Received from Github...");
    }

    //push event from github
    if(name == "push"){
      //console.log(payload.commits);
      //console.log(payload.head_commit.timestamp);
      //console.log(payload.head_commit.committer.username);
      //console.log(payload.sender.avatar_url);
      //console.log(payload.head_commit.message);
      //console.log(payload.head_commit.modified);
      //console.log(payload.repository.owner.url);
      //console.log(payload.repository.owner.name);
      console.log(payload.organization);
      //console.log(payload.head_commit.url);
      //console.log(payload);
      try{
        const embed = new Discord.RichEmbed()
        .setTitle("Github: " + name)
        .setAuthor(payload.head_commit.committer.username, payload.sender.avatar_url)
        .setColor(0x00AE86)
        .setDescription(payload.head_commit.message)
        .setFooter(payload.head_commit.timestamp, payload.organization.avatar_url)
        .setImage(payload.organization.avatar_ur)
        .setThumbnail(payload.organization.avatar_ur)
        .setTimestamp()
        .setURL(payload.head_commit.url)
        .addField("Type of Github Event: ", name)
        .addField("Modified Files: ", payload.head_commit.modified.toString(), true);
  
        //client2.channels.get("402331892474576906").send({embed});
        client2.channels.get(devChatID).send({embed});
        //or message.reply()???
      }catch(e){
        console.log("[GITHUB]: " + e);
      }

      
    }
  }
  
});


externalip(function (err, ip) {
  if(!err){
    require('http').createServer(webhooks.middleware).listen(githubWebhookPort, "0.0.0.0") //ip "0.0.0.0"
    console.log("Github Webhook server live... " + ip + ":" + githubWebhookPort);
    // can now receive webhook events at port 3000
    return;
  }else{
    console.log("Cant get external ip, cant listen for github webooks...");
    process.exit();
  }

});
