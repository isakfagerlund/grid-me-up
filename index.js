import * as tmi from 'tmi.js'
import * as dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
import { getGamesQuery } from "./queries.js";


const client = new tmi.Client({
  channels: ["runthefutmarket"],
});

client.connect();

// Looking at all messages
client.on("message", (_, tags, message) => {
  console.log(`${tags["display-name"]}: ${message}`);
});

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

const main = async () => {
  const gamesQuery = getGamesQuery();
  const gamesFromYesterday = await getGamesFromYesterday(gamesQuery);
  const games = gamesFromYesterday.data.allSeries.edges
  const gamesIds = games.map(game => game.node.id)
  // All games Ids from yesterday
  console.log(gamesIds)
};