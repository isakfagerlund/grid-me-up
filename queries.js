const getMonth = (date) => {
  const currentMonth = date.getMonth() + 1
  if (currentMonth < 10) { 
    return `0${currentMonth}`
  }
  return `${currentMonth}`
}

const getDay = (date) => {
  const currentDay = date.getDate()
  if (currentDay < 10) { 
    return `0${currentDay}`
  }
  return `${currentDay}`
}

const getDaysBackToTodayDates = (daysBack) => {
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - daysBack);



  const formattedToday = `${today.getFullYear()}-${getMonth(today)}-${getDay(today)}`;
  const formattedYesterday = `${yesterday.getFullYear()}-${
    getMonth(yesterday)
  }-${getDay(yesterday)}`;

  return {yesterday: formattedYesterday, today: formattedToday}
}

// Fetch all csgo games from yesterday
export const getGamesQuery = () => {
  // Dota = 2 CSGO = 1
  const gameId = 1;
  const {today, yesterday} = getDaysBackToTodayDates()

  return `
query GetAllSeriesLast24Hours {
  allSeries(
    filter:{
      titleId: ${gameId},
      startTimeScheduled:{
        gte: "${yesterday}T09:05:39+01:00"
        lte: "${today}T09:05:39+01:00"
      }
    }
    orderBy: StartTimeScheduled
  ) {
    totalCount,
    pageInfo{
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    edges{
      cursor
      node{
        id
      }
    }
  }
}`;
};


export const getSeriesFromTournamentIds = (ids) => {
  const {today, yesterday} = getDaysBackToTodayDates(200)

  return `query GetAllSeriesInNext24Hours {
    allSeries(
      filter:{
        tournamentIds: {
          in: [${ids}],
        }
        startTimeScheduled:{
          gte: "${yesterday}T09:05:39+01:00"
          lte: "${today}T09:05:39+01:00"
        }
      }
      last: 50,
      orderBy: StartTimeScheduled,
    ) {
      totalCount,
      pageInfo{
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
      edges{
        cursor
        node{
          id
        }
      }
    }
  }`
}

export const getLiveSeriesDataFromId = (ids) => {
  return `query GetLiveDotaSeriesState {
    seriesState(id: ${ids}) {
      valid
      updatedAt
      format
      games {
        teams {
          name
          players {
            name
            kills
            deaths
          }
        }
      }
    }
  }`
}
