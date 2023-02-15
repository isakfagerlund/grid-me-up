import { getSeriesFromTournamentIdsByDate, getLiveSeriesDataFromId } from "./queries.js";
import fetch from 'node-fetch';

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

  console.log('Games found:', games.length)

  // Loop array and find duplicates. Merge kills and deasths with all duplicates
  const playersMap = new Map()
  const mergePlayers = players.map(player => {
    const playerInMap = playersMap.get(player.name)
    if (playerInMap) {
      playersMap.set(player.name, {
        name: player.name,
        kills: playerInMap.kills + player.kills,
        deaths: playerInMap.deaths + player.deaths
      })
    } else {
      playersMap.set(player.name, { name: player.name, kills: player.kills, deaths: player.deaths })
    }
  }
  )

  return playersMap
}
getLivePlayerData

const getAllTotalGames = async (ids) => {
  const data = await Promise.all(ids.map(id => getLivePlayerData(getLiveSeriesDataFromId(id))))
  const games = data.map(series => series.data?.seriesState?.games).filter(Boolean)
  return games.flat()
}

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


export const getTopFragger = async (tournamentIDs) => {
  const { data } = await getGamesFromYesterday(getSeriesFromTournamentIdsByDate(tournamentIDs))

  const series = data?.allSeries?.edges?.map(edge => edge.node.id)

  if (!series) {
    return console.log('There is no series')
  }

  const allGames = await getAllTotalGames(series)
  const players = getPlayersFromGames(allGames)
  const topFragger = Array.from(players.values()).sort((a, b) => b.kills - a.kills)[0]
  return topFragger
}