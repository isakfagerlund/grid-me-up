// Fetch all csgo games from yesterday
export const getGamesQuery = () => {
  // Dota = 2 CSGO = 1
  const gameId = 2;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formattedToday = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;
  const formattedYesterday = `${yesterday.getFullYear()}-${
    yesterday.getMonth() + 1
  }-${yesterday.getDate()}`;

  return `
query GetAllSeriesLast24Hours {
  allSeries(
    filter:{
      titleId: ${gameId},
      startTimeScheduled:{
        gte: "${formattedYesterday}T09:05:39+01:00"
        lte: "${formattedToday}T09:05:39+01:00"
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
