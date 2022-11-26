import * as tmi from 'tmi.js'
import * as dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
import { getGamesQuery } from "./queries.js";

const getGamesFromYesterday = async (gamesQuery) => {
  const request = await fetch("https://api-op.grid.gg/central-data/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify({
      query: gamesQuery,
    }),
  });

  return await request.json();
};

const client = new tmi.Client({
  channels: ["hoggiqq"],
  identity: {
    username: 'wiesaa',
    password: '939oesn65i8l6pap4mwolquo6u9yro'
  }
});

client.connect();

// Looking at all messages
client.on("message", async (channel, tags, message) => {
  const username = tags["display-name"]
  const isNotBot = username.toLowerCase() !== 'wiesaa';

  if(isNotBot) {
    if(message === '!gameId') {
      const gamesQuery = getGamesQuery();
      const gamesFromYesterday = await getGamesFromYesterday(gamesQuery);
      const games = gamesFromYesterday.data.allSeries.edges
      const gamesIds = games.map(game => game.node.id)

      client.say(channel, `${gamesIds[0]}`);
    }
  }
});