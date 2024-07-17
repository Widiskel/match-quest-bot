# MATCHQUEST BOT

Match Quest Bot, is Mining game Bot on Telegram.

## BOT FEATURE

- Auto Complete Quest
- Auto Mining
- Auto Purchase Benefitable Product
- Auto Play Game

## Prerequisite

- Git
- Node JS
- TELEGRAM_APP_ID & TELEGRAM_APP_HASH Get it from [Here](https://my.telegram.org/auth?to=apps)
- Match Account , Create [Here](https://t.me/MatchQuestBot/start?startapp=548768a34050c1a7ae9332d0fbba3ae1) ,dont forget to join match channel because that missions is incompletable automatically.
## Setup & Configure BOT

1. clone project repo `git clone https://github.com/Widiskel/match-mining-bot.git` and cd to project dir `cd match-mining-bot`
2. run `npm install`
3. run `cp src/config/config_tmp.js src/config/config.js`
   To configure the app, open `src/config.js` and add your telegram app id and hash there
4. run `mkdir sessions`
5. to start the app run `npm run start`

## Setup Session

1. run bot `npm run start`
2. choose option 1 create session
3. enter session name
4. enter your phone number starting with countrycode ex : `+628xxxxxxxx`
5. after creating sessions, choose 3 start bot, sometimes error happen when run bot afer creating session , just `ctrl+c` twice and `npm run start` again
6. if something wrong with your sessions, reset sessions first, to cancel running bot press `ctrl+c` twice, and start again [from No 1.](#setup-session). Remember reset session will delete all you sessions, you can also delete only the trouble sessions by `rm -rf sessions/YOURTROUBLESESSION` after that start to recreate sessions again

## Note

This bot using telegram sessions. if you ever use one of my bot that use telegram sessions, you can just copy the sessions folder to this bot. Also for the telegram APP ID and Hash you can use it on another bot.

## CONTRIBUTE

Feel free to fork and contribute adding more feature thanks.

## SUPPORT

want to support me for creating another bot ?
**star** my repo or buy me a coffee on

EVM : `0x0fd08d2d42ff086bf8c6d057d02d802bf217559a`

SOLANA : `3tE3Hs7P2wuRyVxyMD7JSf8JTAmEekdNsQWqAnayE1CN`
