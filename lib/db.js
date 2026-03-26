import crypto from "node:crypto";
import { cache } from "react";
import { getSupabaseAdmin, hasSupabaseConfig } from "./supabase";

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function planConfig(plan) {
  return plan === "YEARLY" ? { price: 299, prizeContribution: 144 } : { price: 29, prizeContribution: 12 };
}

function monthlyEquivalent(plan) {
  return plan === "YEARLY" ? 299 / 12 : 29;
}

function serializeDate(value) {
  return value ? new Date(value).toISOString() : null;
}

function splitEvents(eventsCsv) {
  return eventsCsv ? eventsCsv.split("|").filter(Boolean) : [];
}

function mapCharity(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    location: row.location,
    featured: Boolean(row.featured),
    description: row.description,
    imageUrl: row.image_url,
    eventsCsv: row.events_csv,
    events: splitEvents(row.events_csv),
    createdAt: row.created_at
  };
}

function unwrap(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  return result.data;
}

function isMissingTableError(result, tableName) {
  const message = result?.error?.message || "";
  return Boolean(result?.error) && message.includes(`Could not find the table 'public.${tableName}'`);
}

function buildSnapshot(rows) {
  const charities = rows.charities.map(mapCharity);
  const charitiesById = new Map(charities.map((charity) => [charity.id, charity]));
  const proofByWinnerId = new Map(rows.winnerProofs.map((proof) => [proof.winner_id, proof]));
  const winnersByDrawId = rows.winners.reduce((acc, winner) => {
    const current = acc.get(winner.draw_id) || [];
    current.push(winner);
    acc.set(winner.draw_id, current);
    return acc;
  }, new Map());
  const draws = rows.draws
    .map((draw) => ({
      id: draw.id,
      month: draw.month,
      mode: draw.mode,
      status: draw.status,
      numbersCsv: draw.numbers_csv,
      jackpotCarry: draw.jackpot_carry,
      createdAt: draw.created_at,
      publishedAt: draw.published_at,
      winners: (winnersByDrawId.get(draw.id) || [])
        .map((winner) => {
          const proof = proofByWinnerId.get(winner.id);
          return {
            id: winner.id,
            userId: winner.user_id,
            drawId: winner.draw_id,
            tier: winner.tier,
            amount: winner.amount,
            status: winner.status,
            proof: proof
              ? {
                  id: proof.id,
                  note: proof.note,
                  status: proof.status,
                  createdAt: proof.created_at
                }
              : null
          };
        })
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const drawsByNewest = [...draws].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const subscriptionsByUserId = new Map(rows.subscriptions.map((subscription) => [subscription.user_id, subscription]));
  const charitySelectionsByUserId = new Map(rows.charitySelections.map((selection) => [selection.user_id, selection]));
  const scoresByUserId = rows.scores.reduce((acc, score) => {
    const current = acc.get(score.user_id) || [];
    current.push(score);
    acc.set(score.user_id, current);
    return acc;
  }, new Map());
  const winningsByUserId = drawsByNewest.reduce((acc, draw) => {
    draw.winners.forEach((winner) => {
      const current = acc.get(winner.userId) || [];
      current.push({ ...winner, draw });
      acc.set(winner.userId, current);
    });
    return acc;
  }, new Map());

  const users = rows.users
    .map((user) => {
      const subscription = subscriptionsByUserId.get(user.id);
      const selection = charitySelectionsByUserId.get(user.id);
      const scores = (scoresByUserId.get(user.id) || [])
        .map((score) => ({
          id: score.id,
          value: score.value,
          playedAt: serializeDate(score.played_at),
          createdAt: score.created_at
        }))
        .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
      const winnings = winningsByUserId.get(user.id) || [];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        passwordHash: user.password_hash,
        subscription: subscription
          ? {
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              price: subscription.price,
              prizeContribution: subscription.prize_contribution,
              renewalDate: serializeDate(subscription.renewal_date)
            }
          : null,
        charityChoice: selection
          ? {
              id: selection.id,
              charityId: selection.charity_id,
              percentage: selection.percentage,
              independentDonation: selection.independent_donation,
              charity: charitiesById.get(selection.charity_id) || null
            }
          : null,
        scores,
        winnings
      };
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return { users, charities, draws };
}

const snapshot = cache(async function snapshot() {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const supabase = getSupabaseAdmin();
  const results = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("subscriptions").select("*"),
    supabase.from("charities").select("*"),
    supabase.from("charity_selections").select("*"),
    supabase.from("scores").select("*"),
    supabase.from("draws").select("*"),
    supabase.from("winners").select("*"),
    supabase.from("winner_proofs").select("*")
  ]);
  const [users, subscriptions, charities, charitySelections, scores, draws, winners, winnerProofs] = results;

  return buildSnapshot({
    users: unwrap(users, "Failed to load users") || [],
    subscriptions: unwrap(subscriptions, "Failed to load subscriptions") || [],
    charities: unwrap(charities, "Failed to load charities") || [],
    charitySelections: unwrap(charitySelections, "Failed to load charity selections") || [],
    scores: unwrap(scores, "Failed to load scores") || [],
    draws: unwrap(draws, "Failed to load draws") || [],
    winners: unwrap(winners, "Failed to load winners") || [],
    winnerProofs: unwrap(winnerProofs, "Failed to load winner proofs") || []
  });
});

async function getUsers() {
  return (await snapshot()).users;
}

async function getCharities() {
  return (await snapshot()).charities;
}

async function getDraws() {
  return (await snapshot()).draws;
}

async function getCharityBySlug(slug) {
  return (await getCharities()).find((charity) => charity.slug === slug) || null;
}

async function getUserByEmail(email) {
  return (await getUsers()).find((user) => user.email === email) || null;
}

async function getUserById(userId) {
  return (await getUsers()).find((user) => user.id === userId) || null;
}

async function createUser({ name, email, passwordHash, plan, charityId, charityPercent }) {
  const supabase = getSupabaseAdmin();
  const userId = id();
  const createdAt = now();
  const config = planConfig(plan);
  const renewalDate = new Date(Date.now() + (plan === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

  unwrap(
    await supabase.from("users").insert({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      role: "SUBSCRIBER",
      created_at: createdAt
    }),
    "Failed to create user"
  );

  unwrap(
    await supabase.from("subscriptions").insert({
      id: id(),
      user_id: userId,
      plan,
      status: "ACTIVE",
      price: config.price,
      prize_contribution: config.prizeContribution,
      renewal_date: renewalDate,
      created_at: createdAt
    }),
    "Failed to create subscription"
  );

  unwrap(
    await supabase.from("charity_selections").insert({
      id: id(),
      user_id: userId,
      charity_id: charityId,
      percentage: charityPercent,
      independent_donation: 0
    }),
    "Failed to create charity selection"
  );

  return getUserById(userId);
}

async function createAdminUser({ name, email, passwordHash }) {
  const userId = id();

  unwrap(
    await getSupabaseAdmin().from("users").insert({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      role: "ADMIN",
      created_at: now()
    }),
    "Failed to create admin user"
  );

  return getUserById(userId);
}

async function createSession(userId, token, expiresAt) {
  const result = await getSupabaseAdmin().from("sessions").insert({
    id: id(),
    token,
    user_id: userId,
    expires_at: expiresAt,
    created_at: now()
  });

  if (isMissingTableError(result, "sessions")) {
    throw new Error("Failed to create session: Supabase table 'public.sessions' is missing. Apply supabase/schema.sql.");
  }

  unwrap(
    result,
    "Failed to create session"
  );
}

async function deleteSession(token) {
  const result = await getSupabaseAdmin().from("sessions").delete().eq("token", token);

  if (isMissingTableError(result, "sessions")) {
    return;
  }

  unwrap(result, "Failed to delete session");
}

async function getSession(token) {
  const result = await getSupabaseAdmin().from("sessions").select("*").eq("token", token).maybeSingle();

  if (isMissingTableError(result, "sessions")) {
    return null;
  }

  const data = unwrap(result, "Failed to load session");

  return data
    ? {
        id: data.id,
        token: data.token,
        userId: data.user_id,
        expiresAt: data.expires_at,
        createdAt: data.created_at
      }
    : null;
}

async function addScore(userId, value, playedAt) {
  const supabase = getSupabaseAdmin();

  unwrap(
    await supabase.from("scores").insert({
      id: id(),
      user_id: userId,
      value,
      played_at: playedAt,
      created_at: now()
    }),
    "Failed to add score"
  );

  const scores = unwrap(
    await supabase.from("scores").select("id").eq("user_id", userId).order("played_at", { ascending: false }).order("created_at", { ascending: false }),
    "Failed to trim scores"
  );
  const overflow = (scores || []).slice(5).map((item) => item.id);

  if (overflow.length) {
    unwrap(await supabase.from("scores").delete().in("id", overflow), "Failed to remove overflow scores");
  }
}

async function updateScore(scoreId, value, playedAt) {
  unwrap(
    await getSupabaseAdmin().from("scores").update({ value, played_at: playedAt }).eq("id", scoreId),
    "Failed to update score"
  );
}

async function updateUserProfile(userId, name, email) {
  unwrap(await getSupabaseAdmin().from("users").update({ name, email }).eq("id", userId), "Failed to update profile");
}

async function updateSubscription(userId, status, renewalDate) {
  unwrap(
    await getSupabaseAdmin().from("subscriptions").update({ status, renewal_date: renewalDate }).eq("user_id", userId),
    "Failed to update subscription"
  );
}

async function updateCharitySelection(userId, charityId, percentage, independentDonation = 0) {
  unwrap(
    await getSupabaseAdmin()
      .from("charity_selections")
      .update({ charity_id: charityId, percentage, independent_donation: independentDonation })
      .eq("user_id", userId),
    "Failed to update charity selection"
  );
}

async function upsertWinnerProof({ userId, winnerId, note }) {
  const supabase = getSupabaseAdmin();
  const proof = unwrap(
    await supabase.from("winner_proofs").select("id").eq("winner_id", winnerId).maybeSingle(),
    "Failed to load winner proof"
  );

  if (proof) {
    unwrap(
      await supabase.from("winner_proofs").update({ note, status: "PENDING" }).eq("winner_id", winnerId),
      "Failed to update winner proof"
    );
    return;
  }

  unwrap(
    await supabase.from("winner_proofs").insert({
      id: id(),
      winner_id: winnerId,
      user_id: userId,
      note,
      status: "PENDING",
      created_at: now()
    }),
    "Failed to create winner proof"
  );
}

async function createDraw({ month, mode, status, numbersCsv, jackpotCarry, winners }) {
  const supabase = getSupabaseAdmin();
  const drawId = id();
  const createdAt = now();

  unwrap(
    await supabase.from("draws").insert({
      id: drawId,
      month,
      mode,
      status,
      numbers_csv: numbersCsv,
      jackpot_carry: jackpotCarry,
      created_at: createdAt,
      published_at: status === "PUBLISHED" ? createdAt : null
    }),
    "Failed to create draw"
  );

  if (winners.length) {
    unwrap(
      await supabase.from("winners").insert(
        winners.map((winner) => ({
          id: id(),
          draw_id: drawId,
          user_id: winner.userId,
          tier: winner.tier,
          amount: winner.amount,
          status: "PENDING"
        }))
      ),
      "Failed to create winners"
    );
  }

  return (await getDraws()).find((draw) => draw.id === drawId) || null;
}

async function publishDraw(drawId, jackpotCarry) {
  unwrap(
    await getSupabaseAdmin().from("draws").update({ status: "PUBLISHED", published_at: now(), jackpot_carry: jackpotCarry }).eq("id", drawId),
    "Failed to publish draw"
  );
}

async function updateWinnerStatus(winnerId, status) {
  const supabase = getSupabaseAdmin();

  unwrap(await supabase.from("winners").update({ status }).eq("id", winnerId), "Failed to update winner status");
  unwrap(
    await supabase.from("winner_proofs").update({ status: status === "REJECTED" ? "REJECTED" : "APPROVED" }).eq("winner_id", winnerId),
    "Failed to update winner proof status"
  );
}

async function createCharity({ name, slug, category, location, description, imageUrl, eventsCsv, featured }) {
  const supabase = getSupabaseAdmin();

  if (featured) {
    unwrap(await supabase.from("charities").update({ featured: false }).neq("id", ""), "Failed to clear featured charity");
  }

  unwrap(
    await supabase.from("charities").insert({
      id: id(),
      name,
      slug,
      category,
      location,
      featured,
      description,
      image_url: imageUrl,
      events_csv: eventsCsv,
      created_at: now()
    }),
    "Failed to create charity"
  );
}

async function updateCharity({ charityId, name, slug, category, location, description, imageUrl, eventsCsv, featured }) {
  const supabase = getSupabaseAdmin();

  if (featured) {
    unwrap(await supabase.from("charities").update({ featured: false }).neq("id", charityId), "Failed to clear featured charity");
  }

  unwrap(
    await supabase
      .from("charities")
      .update({ name, slug, category, location, featured, description, image_url: imageUrl, events_csv: eventsCsv })
      .eq("id", charityId),
    "Failed to update charity"
  );
}

async function deleteCharity(charityId) {
  const supabase = getSupabaseAdmin();
  const linkedSelections = unwrap(
    await supabase.from("charity_selections").select("id").eq("charity_id", charityId),
    "Failed to check charity usage"
  );

  if ((linkedSelections || []).length) {
    return false;
  }

  unwrap(await supabase.from("charities").delete().eq("id", charityId), "Failed to delete charity");
  return true;
}

async function getActiveSubscribers() {
  return (await getUsers()).filter((user) => user.role === "SUBSCRIBER" && user.subscription?.status === "ACTIVE");
}

export {
  hasSupabaseConfig,
  createUser,
  createAdminUser,
  createSession,
  deleteSession,
  getSession,
  getUsers,
  getUserByEmail,
  getUserById,
  getCharities,
  getCharityBySlug,
  getDraws,
  getActiveSubscribers,
  addScore,
  updateScore,
  updateUserProfile,
  updateSubscription,
  updateCharitySelection,
  upsertWinnerProof,
  createDraw,
  publishDraw,
  updateWinnerStatus,
  createCharity,
  updateCharity,
  deleteCharity,
  monthlyEquivalent
};
