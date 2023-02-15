import fetch from 'node-fetch';
import { getAllSeriesFromTournamentIds } from './queries.js'
import { isAfter, isBefore, format } from 'date-fns'


const getGames = async (gamesQuery) => {
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

const getNextSeries = (series) => {
 
  // get todays date
  const today = new Date()

  // filter away every series before todays date

  const filteredSeries = series.filter(serie => isAfter(new Date(serie.node.startTimeScheduled), today))

  // grab first item

  const formattedSerie = () => {
    const serie = filteredSeries[0]

    const teamOne = serie.node.teams[0].baseInfo.name
    const teamTwo = serie.node.teams[1].baseInfo.name
    const time = format(new Date(serie.node.startTimeScheduled), 'k:mm')

    return `${teamOne} vs ${teamTwo} - ${time}`
  }
  
  return formattedSerie()
}

const getPreviousSeries = (series) => {
 
  // get todays date
  const today = new Date()

  // filter away every series before todays date

  const filteredSeries = series.filter(serie => isBefore(new Date(serie.node.startTimeScheduled), today))

  // grab first item
  
  const formattedSerie = () => {
    const serie = filteredSeries[filteredSeries.length - 1]

    const teamOne = serie.node.teams[0].baseInfo.name
    const teamTwo = serie.node.teams[1].baseInfo.name
    const time = format(new Date(serie.node.startTimeScheduled), 'k:mm')

    return `${teamOne} vs ${teamTwo} - ${time}`
  }
  
  return formattedSerie()
}


export const getPreviousAndNextSeries = async (tournamentIDs) => {
  const { data } = await getGames(getAllSeriesFromTournamentIds(tournamentIDs))

  const series = data.allSeries.edges

  if(!series) {
    return console.log('There is no series')
  }

  const nextSeries = getNextSeries(series)
  const previousSeries = getPreviousSeries(series)

  return {nextSeries, previousSeries}
}