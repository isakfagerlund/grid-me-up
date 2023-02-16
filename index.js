import * as tmi from 'tmi.js'
import * as dotenv from 'dotenv'
dotenv.config()
import { getTopFragger } from './getTopFragger.js'
import { getPreviousAndNextSeries } from './getNextAndPreviousSeries.js'

const client = new tmi.Client({
  channels: [process.env.TWITCH_CHANNEL],
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD
  }
});

client.connect();

client.on("message", async (channel, tags, message) => {
  if (message === '!previous') {
    try {
      const {previousSeries} = await getPreviousAndNextSeries([process.env.TOURNAMENT_ID])
      client.say(channel, previousSeries);
    } catch (error) {
      console.log(error)
    }
  } else if (message === '!upcoming') {
    try {
      const {nextSeries} = await getPreviousAndNextSeries([process.env.TOURNAMENT_ID])
      client.say(channel, nextSeries);
    } catch (error) {
      console.log(error)
    }
  } else if(message === '!mvp') {
    try {
      const fragger = await getTopFragger([process.env.TOURNAMENT_ID])

      client.say(channel, `The top overall fragger in the CCT Central Europe Malta Finals is: ${fragger.name} with ${fragger.kills} Kills`);
    } catch (error) {
      console.log(error)
    }
  }
});