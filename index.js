import * as tmi from 'tmi.js'
import * as dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
import { getGamesQuery, getSeriesFromTournamentIds, getLiveSeriesDataFromId} from "./queries.js";

const getGamesFromYesterday = async (gamesQuery) => {
  try {
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

  } catch (error) {
    console.log(error)
  }
};

const getLivePlayerData = async (query) => {
  const request = await fetch("https://api-op.grid.gg/live-data-feed/series-state/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY,
    },
    body: JSON.stringify({
      query: query,
    }),
  });

  return await request.json();
}

const getPlayersFromGames = (games) => {
  const players = games.map(game => {
    const teamOnePlayers = game.teams[0].players
    const teamTwoPlayers = game.teams[1].players

    return [...teamOnePlayers, ...teamTwoPlayers]
  }).flat()

  console.log(games.length)
  
  // Loop array and find duplicates. Merge kills and deasths with all duplicates
  const playersMap = new Map()
  const mergePlayers = players.map(player => {
    const playerInMap = playersMap.get(player.name)
    if(playerInMap){
      playersMap.set(player.name, {
        name: player.name,
        kills: playerInMap.kills + player.kills,
        deaths: playerInMap.deaths + player.deaths
      })
    }else {
      playersMap.set(player.name, {name: player.name, kills: player.kills, deaths: player.deaths})
    }
  }
  )

  return playersMap
}

const getAllTotalGames = async (ids) => {
  const data = await Promise.all(ids.map(id => getLivePlayerData(getLiveSeriesDataFromId(id))))
  const games = data.map(series => series.data?.seriesState?.games).filter(Boolean)
  return games.flat()
}
 
const getTopFragger = async () => {
  const { data } = await getGamesFromYesterday(getSeriesFromTournamentIds(["223645", "106889", "230654", "251104", "106888"]))

  const series = data?.allSeries?.edges?.map(edge => edge.node.id)

  if(!series) {
    return console.log('There is no series')
  }

  const allGames = await getAllTotalGames(series)
  const players = getPlayersFromGames(allGames)
  const topFragger = Array.from(players.values()).sort((a,b) => b.kills - a.kills).flat[0]
  return topFragger
}

const client = new tmi.Client({
  channels: ["hoggiqq"],
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD
  }
});

client.connect();

// Looking at all messages
client.on("message", async (channel, tags, message) => {
  const username = tags["display-name"]

  if(message === '!dailyMVP') {
    const fragger = await getTopFragger()
    console.log(fragger)

    client.say(channel, `Top fragger is: ${fragger.name} with ${fragger.kills} Kills 🔫 and ${fragger.deaths} Deaths ☠️`);
  }
  
});

// const main = async () => {
//   const topFragger = await getTopFragger()
//   console.log(topFragger)
// }

// main()