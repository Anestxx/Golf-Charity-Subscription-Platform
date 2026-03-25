import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin, hasSupabaseConfig } from "./supabase";

const dataDir = path.join(process.cwd(), "data");
const databasePath = path.join(dataDir, "good-drive.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA foreign_keys = ON;");

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

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'SUBSCRIBER',
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    price INTEGER NOT NULL,
    prize_contribution INTEGER NOT NULL,
    renewal_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS charities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    events_csv TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS charity_selections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    charity_id TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    independent_donation INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    value INTEGER NOT NULL,
    played_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS draws (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    mode TEXT NOT NULL,
    status TEXT NOT NULL,
    numbers_csv TEXT NOT NULL,
    jackpot_carry INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    published_at TEXT
  );
  CREATE TABLE IF NOT EXISTS winners (
    id TEXT PRIMARY KEY,
    draw_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (draw_id) REFERENCES draws(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS winner_proofs (
    id TEXT PRIMARY KEY,
    winner_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    note TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    FOREIGN KEY (winner_id) REFERENCES winners(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

function seedSqlite() {
  const count = sqlite.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (count > 0) return;

  const subscriberHash = bcrypt.hashSync("demo123", 10);
  const adminHash = bcrypt.hashSync("admin123", 10);
  const charityIds = [id(), id(), id()];
  const userIds = [id(), id(), id()];
  const drawIds = [id(), id()];
  const winnerIds = [id(), id()];
  const createdAt = now();

  const insertCharity = sqlite.prepare(`
    INSERT INTO charities (id, name, slug, category, location, featured, description, image_url, events_csv, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCharity.run(
    charityIds[0],
    "First Green Futures",
    "first-green-futures",
    "Youth Access",
    "London",
    1,
    "Funds youth golf access, coaching scholarships, and equipment for underrepresented junior golfers.",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    "Spring Golf Day|Junior Golf Clinics",
    createdAt
  );
  insertCharity.run(
    charityIds[1],
    "Fairways For Recovery",
    "fairways-for-recovery",
    "Mental Health",
    "Manchester",
    0,
    "Supports golf-linked mental health recovery programs, mentoring, and return-to-play initiatives.",
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    "Open Hearts Golf Day|Golf Coaching Circle",
    createdAt
  );
  insertCharity.run(
    charityIds[2],
    "Green Mile Relief",
    "green-mile-relief",
    "Crisis Support",
    "Birmingham",
    0,
    "Delivers emergency grants for families facing hardship through golf-day fundraising and member giving.",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    "Summer Charity Golf Classic|Relief Golf Auction",
    createdAt
  );

  const insertUser = sqlite.prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)");
  insertUser.run(userIds[0], "Maya Thompson", "maya@example.com", subscriberHash, "SUBSCRIBER", createdAt);
  insertUser.run(userIds[1], "Arjun Patel", "arjun@example.com", subscriberHash, "SUBSCRIBER", createdAt);
  insertUser.run(userIds[2], "Ava Collins", "admin@example.com", adminHash, "ADMIN", createdAt);

  const insertSubscription = sqlite.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, price, prize_contribution, renewal_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSubscription.run(id(), userIds[0], "YEARLY", "ACTIVE", 299, 144, "2026-12-01T00:00:00.000Z", createdAt);
  insertSubscription.run(id(), userIds[1], "MONTHLY", "ACTIVE", 29, 12, "2026-04-10T00:00:00.000Z", createdAt);

  const insertSelection = sqlite.prepare(`
    INSERT INTO charity_selections (id, user_id, charity_id, percentage, independent_donation)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSelection.run(id(), userIds[0], charityIds[0], 18, 0);
  insertSelection.run(id(), userIds[1], charityIds[1], 12, 0);

  const insertScore = sqlite.prepare("INSERT INTO scores (id, user_id, value, played_at, created_at) VALUES (?, ?, ?, ?, ?)");
  [["2026-03-18T00:00:00.000Z", 21], ["2026-03-11T00:00:00.000Z", 24], ["2026-03-04T00:00:00.000Z", 20], ["2026-02-25T00:00:00.000Z", 19], ["2026-02-18T00:00:00.000Z", 22]].forEach(
    ([playedAt, value]) => insertScore.run(id(), userIds[0], value, playedAt, createdAt)
  );
  [["2026-03-20T00:00:00.000Z", 16], ["2026-03-12T00:00:00.000Z", 18], ["2026-03-05T00:00:00.000Z", 18], ["2026-02-27T00:00:00.000Z", 17], ["2026-02-19T00:00:00.000Z", 15]].forEach(
    ([playedAt, value]) => insertScore.run(id(), userIds[1], value, playedAt, createdAt)
  );

  sqlite.prepare(`
    INSERT INTO draws (id, month, mode, status, numbers_csv, jackpot_carry, created_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(drawIds[0], "2026-02", "RANDOM", "PUBLISHED", "19,21,24,30,34", 760, createdAt, "2026-02-28T12:00:00.000Z");
  sqlite.prepare(`
    INSERT INTO draws (id, month, mode, status, numbers_csv, jackpot_carry, created_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(drawIds[1], "2026-03", "ALGORITHM", "DRAFT", "16,18,20,22,24", 760, createdAt, null);

  sqlite.prepare("INSERT INTO winners (id, draw_id, user_id, tier, amount, status) VALUES (?, ?, ?, ?, ?, ?)").run(
    winnerIds[0],
    drawIds[0],
    userIds[0],
    "FOUR_MATCH",
    320,
    "PAID"
  );
  sqlite.prepare("INSERT INTO winners (id, draw_id, user_id, tier, amount, status) VALUES (?, ?, ?, ?, ?, ?)").run(
    winnerIds[1],
    drawIds[1],
    userIds[0],
    "THREE_MATCH",
    110,
    "PENDING"
  );
  sqlite.prepare("INSERT INTO winner_proofs (id, winner_id, user_id, note, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id(),
    winnerIds[1],
    userIds[0],
    "Screenshot reference uploaded for review.",
    "PENDING",
    createdAt
  );
}

seedSqlite();

function buildSnapshot(rows) {
  const charities = rows.charities.map(mapCharity);
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
      winners: rows.winners
        .filter((winner) => winner.draw_id === draw.id)
        .map((winner) => {
          const proof = rows.winnerProofs.find((item) => item.winner_id === winner.id);
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

  const users = rows.users
    .map((user) => {
      const subscription = rows.subscriptions.find((item) => item.user_id === user.id);
      const selection = rows.charitySelections.find((item) => item.user_id === user.id);
      const scores = rows.scores
        .filter((score) => score.user_id === user.id)
        .map((score) => ({
          id: score.id,
          value: score.value,
          playedAt: serializeDate(score.played_at),
          createdAt: score.created_at
        }))
        .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
      const winnings = draws
        .flatMap((draw) => draw.winners.filter((winner) => winner.userId === user.id).map((winner) => ({ ...winner, draw })))
        .sort((a, b) => new Date(b.draw.createdAt) - new Date(a.draw.createdAt));

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
              charity: charities.find((charity) => charity.id === selection.charity_id) || null
            }
          : null,
        scores,
        winnings
      };
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return { users, charities, draws };
}

function sqliteSnapshot() {
  return buildSnapshot({
    users: sqlite.prepare("SELECT * FROM users").all(),
    sessions: sqlite.prepare("SELECT * FROM sessions").all(),
    subscriptions: sqlite.prepare("SELECT * FROM subscriptions").all(),
    charities: sqlite.prepare("SELECT * FROM charities").all(),
    charitySelections: sqlite.prepare("SELECT * FROM charity_selections").all(),
    scores: sqlite.prepare("SELECT * FROM scores").all(),
    draws: sqlite.prepare("SELECT * FROM draws").all(),
    winners: sqlite.prepare("SELECT * FROM winners").all(),
    winnerProofs: sqlite.prepare("SELECT * FROM winner_proofs").all()
  });
}

async function supabaseSnapshot() {
  const supabase = getSupabaseAdmin();
  const [users, sessions, subscriptions, charities, charitySelections, scores, draws, winners, winnerProofs] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("sessions").select("*"),
    supabase.from("subscriptions").select("*"),
    supabase.from("charities").select("*"),
    supabase.from("charity_selections").select("*"),
    supabase.from("scores").select("*"),
    supabase.from("draws").select("*"),
    supabase.from("winners").select("*"),
    supabase.from("winner_proofs").select("*")
  ]);

  const errors = [users, sessions, subscriptions, charities, charitySelections, scores, draws, winners, winnerProofs]
    .map((result) => result.error)
    .filter(Boolean);
  if (errors.length) {
    throw errors[0];
  }

  return buildSnapshot({
    users: users.data || [],
    sessions: sessions.data || [],
    subscriptions: subscriptions.data || [],
    charities: charities.data || [],
    charitySelections: charitySelections.data || [],
    scores: scores.data || [],
    draws: draws.data || [],
    winners: winners.data || [],
    winnerProofs: winnerProofs.data || []
  });
}

async function snapshot() {
  return hasSupabaseConfig ? supabaseSnapshot() : sqliteSnapshot();
}

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
  const userId = id();
  const createdAt = now();
  const config = planConfig(plan);
  const renewalDate = new Date(Date.now() + (plan === "YEARLY" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString();

  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    await supabase.from("users").insert({ id: userId, name, email, password_hash: passwordHash, role: "SUBSCRIBER", created_at: createdAt });
    await supabase.from("subscriptions").insert({
      id: id(),
      user_id: userId,
      plan,
      status: "ACTIVE",
      price: config.price,
      prize_contribution: config.prizeContribution,
      renewal_date: renewalDate,
      created_at: createdAt
    });
    await supabase.from("charity_selections").insert({
      id: id(),
      user_id: userId,
      charity_id: charityId,
      percentage: charityPercent,
      independent_donation: 0
    });
  } else {
    sqlite.prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      userId,
      name,
      email,
      passwordHash,
      "SUBSCRIBER",
      createdAt
    );
    sqlite.prepare(`
      INSERT INTO subscriptions (id, user_id, plan, status, price, prize_contribution, renewal_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id(), userId, plan, "ACTIVE", config.price, config.prizeContribution, renewalDate, createdAt);
    sqlite.prepare(`
      INSERT INTO charity_selections (id, user_id, charity_id, percentage, independent_donation)
      VALUES (?, ?, ?, ?, ?)
    `).run(id(), userId, charityId, charityPercent, 0);
  }

  return getUserById(userId);
}

async function createAdminUser({ name, email, passwordHash }) {
  const userId = id();
  const createdAt = now();

  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("users").insert({
      id: userId,
      name,
      email,
      password_hash: passwordHash,
      role: "ADMIN",
      created_at: createdAt
    });
  } else {
    sqlite.prepare("INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      userId,
      name,
      email,
      passwordHash,
      "ADMIN",
      createdAt
    );
  }

  return getUserById(userId);
}

async function createSession(userId, token, expiresAt) {
  const payload = { id: id(), token, user_id: userId, expires_at: expiresAt, created_at: now() };
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("sessions").insert(payload);
  } else {
    sqlite.prepare("INSERT INTO sessions (id, token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").run(
      payload.id,
      payload.token,
      payload.user_id,
      payload.expires_at,
      payload.created_at
    );
  }
}

async function deleteSession(token) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("sessions").delete().eq("token", token);
  } else {
    sqlite.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
}

async function getSession(token) {
  if (hasSupabaseConfig) {
    const { data } = await getSupabaseAdmin().from("sessions").select("*").eq("token", token).maybeSingle();
    return data ? { id: data.id, token: data.token, userId: data.user_id, expiresAt: data.expires_at, createdAt: data.created_at } : null;
  }

  const session = sqlite.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
  return session ? { id: session.id, token: session.token, userId: session.user_id, expiresAt: session.expires_at, createdAt: session.created_at } : null;
}

async function addScore(userId, value, playedAt) {
  const payload = { id: id(), user_id: userId, value, played_at: playedAt, created_at: now() };
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    await supabase.from("scores").insert(payload);
    const { data } = await supabase.from("scores").select("id").eq("user_id", userId).order("played_at", { ascending: false }).order("created_at", { ascending: false });
    const overflow = (data || []).slice(5).map((item) => item.id);
    if (overflow.length) {
      await supabase.from("scores").delete().in("id", overflow);
    }
  } else {
    sqlite.prepare("INSERT INTO scores (id, user_id, value, played_at, created_at) VALUES (?, ?, ?, ?, ?)").run(
      payload.id,
      payload.user_id,
      payload.value,
      payload.played_at,
      payload.created_at
    );
    const scores = sqlite.prepare("SELECT id FROM scores WHERE user_id = ? ORDER BY played_at DESC, created_at DESC").all(userId);
    scores.slice(5).forEach((score) => sqlite.prepare("DELETE FROM scores WHERE id = ?").run(score.id));
  }
}

async function updateScore(scoreId, value, playedAt) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("scores").update({ value, played_at: playedAt }).eq("id", scoreId);
  } else {
    sqlite.prepare("UPDATE scores SET value = ?, played_at = ? WHERE id = ?").run(value, playedAt, scoreId);
  }
}

async function updateUserProfile(userId, name, email) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("users").update({ name, email }).eq("id", userId);
  } else {
    sqlite.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, userId);
  }
}

async function updateSubscription(userId, status, renewalDate) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("subscriptions").update({ status, renewal_date: renewalDate }).eq("user_id", userId);
  } else {
    sqlite.prepare("UPDATE subscriptions SET status = ?, renewal_date = ? WHERE user_id = ?").run(status, renewalDate, userId);
  }
}

async function updateCharitySelection(userId, charityId, percentage, independentDonation = 0) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin()
      .from("charity_selections")
      .update({ charity_id: charityId, percentage, independent_donation: independentDonation })
      .eq("user_id", userId);
  } else {
    sqlite
      .prepare("UPDATE charity_selections SET charity_id = ?, percentage = ?, independent_donation = ? WHERE user_id = ?")
      .run(charityId, percentage, independentDonation, userId);
  }
}

async function upsertWinnerProof({ userId, winnerId, note }) {
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("winner_proofs").select("id").eq("winner_id", winnerId).maybeSingle();
    if (data) {
      await supabase.from("winner_proofs").update({ note, status: "PENDING" }).eq("winner_id", winnerId);
    } else {
      await supabase.from("winner_proofs").insert({ id: id(), winner_id: winnerId, user_id: userId, note, status: "PENDING", created_at: now() });
    }
  } else {
    const proof = sqlite.prepare("SELECT * FROM winner_proofs WHERE winner_id = ?").get(winnerId);
    if (proof) {
      sqlite.prepare("UPDATE winner_proofs SET note = ?, status = 'PENDING' WHERE winner_id = ?").run(note, winnerId);
    } else {
      sqlite.prepare("INSERT INTO winner_proofs (id, winner_id, user_id, note, status, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        id(),
        winnerId,
        userId,
        note,
        "PENDING",
        now()
      );
    }
  }
}

async function createDraw({ month, mode, status, numbersCsv, jackpotCarry, winners }) {
  const drawId = id();
  const createdAt = now();
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    await supabase.from("draws").insert({
      id: drawId,
      month,
      mode,
      status,
      numbers_csv: numbersCsv,
      jackpot_carry: jackpotCarry,
      created_at: createdAt,
      published_at: status === "PUBLISHED" ? createdAt : null
    });
    if (winners.length) {
      await supabase.from("winners").insert(
        winners.map((winner) => ({
          id: id(),
          draw_id: drawId,
          user_id: winner.userId,
          tier: winner.tier,
          amount: winner.amount,
          status: "PENDING"
        }))
      );
    }
  } else {
    sqlite.prepare(`
      INSERT INTO draws (id, month, mode, status, numbers_csv, jackpot_carry, created_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(drawId, month, mode, status, numbersCsv, jackpotCarry, createdAt, status === "PUBLISHED" ? createdAt : null);
    const insertWinner = sqlite.prepare("INSERT INTO winners (id, draw_id, user_id, tier, amount, status) VALUES (?, ?, ?, ?, ?, ?)");
    winners.forEach((winner) => insertWinner.run(id(), drawId, winner.userId, winner.tier, winner.amount, "PENDING"));
  }
  return (await getDraws()).find((draw) => draw.id === drawId);
}

async function publishDraw(drawId, jackpotCarry) {
  if (hasSupabaseConfig) {
    await getSupabaseAdmin().from("draws").update({ status: "PUBLISHED", published_at: now(), jackpot_carry: jackpotCarry }).eq("id", drawId);
  } else {
    sqlite.prepare("UPDATE draws SET status = 'PUBLISHED', published_at = ?, jackpot_carry = ? WHERE id = ?").run(now(), jackpotCarry, drawId);
  }
}

async function updateWinnerStatus(winnerId, status) {
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    await supabase.from("winners").update({ status }).eq("id", winnerId);
    await supabase.from("winner_proofs").update({ status: status === "REJECTED" ? "REJECTED" : "APPROVED" }).eq("winner_id", winnerId);
  } else {
    sqlite.prepare("UPDATE winners SET status = ? WHERE id = ?").run(status, winnerId);
    sqlite.prepare("UPDATE winner_proofs SET status = ? WHERE winner_id = ?").run(status === "REJECTED" ? "REJECTED" : "APPROVED", winnerId);
  }
}

async function createCharity({ name, slug, category, location, description, imageUrl, eventsCsv, featured }) {
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    if (featured) await supabase.from("charities").update({ featured: false }).neq("id", "");
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
    });
  } else {
    if (featured) sqlite.prepare("UPDATE charities SET featured = 0").run();
    sqlite.prepare(`
      INSERT INTO charities (id, name, slug, category, location, featured, description, image_url, events_csv, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id(), name, slug, category, location, featured ? 1 : 0, description, imageUrl, eventsCsv, now());
  }
}

async function updateCharity({ charityId, name, slug, category, location, description, imageUrl, eventsCsv, featured }) {
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    if (featured) await supabase.from("charities").update({ featured: false }).neq("id", charityId);
    await supabase
      .from("charities")
      .update({ name, slug, category, location, featured, description, image_url: imageUrl, events_csv: eventsCsv })
      .eq("id", charityId);
  } else {
    if (featured) sqlite.prepare("UPDATE charities SET featured = 0").run();
    sqlite.prepare(`
      UPDATE charities
      SET name = ?, slug = ?, category = ?, location = ?, featured = ?, description = ?, image_url = ?, events_csv = ?
      WHERE id = ?
    `).run(name, slug, category, location, featured ? 1 : 0, description, imageUrl, eventsCsv, charityId);
  }
}

async function deleteCharity(charityId) {
  if (hasSupabaseConfig) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("charity_selections").select("id").eq("charity_id", charityId);
    if ((data || []).length) return false;
    await supabase.from("charities").delete().eq("id", charityId);
    return true;
  }

  const linked = sqlite.prepare("SELECT COUNT(*) AS count FROM charity_selections WHERE charity_id = ?").get(charityId);
  if (linked.count > 0) return false;
  sqlite.prepare("DELETE FROM charities WHERE id = ?").run(charityId);
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
