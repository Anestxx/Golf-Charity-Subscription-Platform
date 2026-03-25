import { calculatePrizePools } from "./prize-engine";
import { getActiveSubscribers, getCharities, getDraws, getUsers, monthlyEquivalent } from "./db";

export async function getHomepageData() {
  const [charities, draws, subscribers] = await Promise.all([getCharities(), getDraws(), getActiveSubscribers()]);
  const latestPublishedDraw = draws.find((draw) => draw.status === "PUBLISHED") || null;
  const prizePools = calculatePrizePools(
    subscribers.map((user) => user.subscription).filter(Boolean),
    latestPublishedDraw?.jackpotCarry || 0
  );

  const charityImpact = Number(
    subscribers
      .reduce((sum, user) => {
        if (!user.subscription || !user.charityChoice) return sum;
        return (
          sum +
          monthlyEquivalent(user.subscription.plan) * (user.charityChoice.percentage / 100) +
          (user.charityChoice.independentDonation || 0)
        );
      }, 0)
      .toFixed(2)
  );

  return {
    charities,
    featuredCharity: charities.find((item) => item.featured) || charities[0] || null,
    latestPublishedDraw,
    heroStats: {
      subscriberCount: subscribers.length,
      monthlyPrizePool: prizePools.totalContribution,
      charityImpact,
      jackpotCarry: latestPublishedDraw?.jackpotCarry || 0
    },
    prizePools
  };
}

export async function getAdminData() {
  const [allUsers, charities, draws] = await Promise.all([getUsers(), getCharities(), getDraws()]);
  const users = allUsers.filter((user) => user.role === "SUBSCRIBER");
  const latestPublishedDraw = draws.find((draw) => draw.status === "PUBLISHED") || null;
  const prizePools = calculatePrizePools(
    users.map((user) => user.subscription).filter((subscription) => subscription?.status === "ACTIVE"),
    latestPublishedDraw?.jackpotCarry || 0
  );

  const charityTotals = users.reduce((acc, user) => {
    if (!user.subscription || !user.charityChoice?.charity) {
      return acc;
    }

    const amount = monthlyEquivalent(user.subscription.plan) * (user.charityChoice.percentage / 100);
    acc[user.charityChoice.charity.name] = Number(
      ((acc[user.charityChoice.charity.name] || 0) + amount + (user.charityChoice.independentDonation || 0)).toFixed(2)
    );
    return acc;
  }, {});

  const drawStats = {
    totalDraws: draws.length,
    publishedDraws: draws.filter((draw) => draw.status === "PUBLISHED").length,
    draftDraws: draws.filter((draw) => draw.status === "DRAFT").length,
    totalWinnerRecords: users.reduce((sum, user) => sum + user.winnings.length, 0)
  };

  return {
    users,
    charities,
    draws,
    prizePools,
    analytics: {
      totalUsers: users.length,
      totalPrizePool: prizePools.totalContribution + (latestPublishedDraw?.jackpotCarry || 0),
      charityTotals,
      drawStats
    }
  };
}
