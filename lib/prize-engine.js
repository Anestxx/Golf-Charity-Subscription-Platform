export function subscriptionConfig(plan) {
  if (plan === "YEARLY") {
    return { price: 299, prizeContribution: 144 };
  }

  return { price: 29, prizeContribution: 12 };
}

export function monthlyEquivalent(plan) {
  return plan === "YEARLY" ? 299 / 12 : 29;
}

export function calculatePrizePools(activeSubscriptions, jackpotCarry = 0) {
  const totalContribution = activeSubscriptions.reduce((sum, subscription) => sum + subscription.prizeContribution, 0);

  return {
    totalContribution,
    fiveMatch: Math.round(totalContribution * 0.4 + jackpotCarry),
    fourMatch: Math.round(totalContribution * 0.35),
    threeMatch: Math.round(totalContribution * 0.25)
  };
}

export function generateDrawNumbers(mode, scores) {
  if (mode === "ALGORITHM") {
    const frequency = new Map();
    scores.forEach((score) => {
      frequency.set(score.value, (frequency.get(score.value) || 0) + 1);
    });

    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, 5)
      .map(([value]) => value)
      .sort((a, b) => a - b);
  }

  const pool = Array.from({ length: 45 }, (_, index) => index + 1);
  const picks = [];

  while (picks.length < 5 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(index, 1)[0]);
  }

  return picks.sort((a, b) => a - b);
}

export function evaluateWinners({ users, numbers, pools }) {
  const winners = [];
  const buckets = {
    FIVE_MATCH: [],
    FOUR_MATCH: [],
    THREE_MATCH: []
  };

  users.forEach((user) => {
    const scoreSet = new Set(user.scores.map((score) => score.value));
    const matches = numbers.filter((value) => scoreSet.has(value)).length;
    if (matches >= 3) {
      const tier = matches === 5 ? "FIVE_MATCH" : matches === 4 ? "FOUR_MATCH" : "THREE_MATCH";
      buckets[tier].push(user);
    }
  });

  const payouts = {
    FIVE_MATCH: pools.fiveMatch,
    FOUR_MATCH: pools.fourMatch,
    THREE_MATCH: pools.threeMatch
  };

  Object.entries(buckets).forEach(([tier, bucketUsers]) => {
    if (!bucketUsers.length) {
      return;
    }

    const split = Math.round(payouts[tier] / bucketUsers.length);
    bucketUsers.forEach((user) => {
      winners.push({
        userId: user.id,
        tier,
        amount: split
      });
    });
  });

  return winners;
}
