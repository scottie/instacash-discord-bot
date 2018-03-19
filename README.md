# 🤖🤖Instacash-Discord-Bot🤖🤖

Hi! I'm a little utility bot for Discord and **INSTACASH**.
I help people do stuff!!


## !ticker
Yep you guessed it

## !news
Shows latest twitter news from instacash.

## !wallet
!wallet help
!wallet deposit (or address)
!wallet balance
!wallet send <TO ADDRESS> <AMOUNT> (use as withdraw)

## !tip
!tip help
!tip <USERID> <AMOUNT>

## !rain
!rain help
!rain <NUMBER TO RAIN ON> <AMOUNT EACH>

## !lol
!lol
Returns back chuck norris style instacash jokes...

## !download
Latest download link for most recent wallet and vesrion

## !explorer
!explorer <COMMAND>
Commands: getinfo getdifficulty getconnectioncount getblockcount, etc
ie: !explorer getdifficulty


## Github Integration
Posts pushes from github to discord

## Spam Filter
Kicks spam user and removes those pesky discord.gg/invite/spammers.


# Install

```
apt-get install default-jre nodejs npm build-essential screen
git clone <url>
cd <dir>
npm install
```

Dev:
```
screen
npm install nodemon --global
npm run dev
```

Production:
```
screen
npm install forever --global
npm start

or

pm2 start App.js --watch
pm2 list
pm2 logs App
```

Stop:
```
forever list
forever stop <PID>
```


# License

Keep originals names and mentions in the code.


```