"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, getCurrentUser, requireUser } from "@/lib/auth";
import {
  addScore,
  createAdminUser,
  createCharity,
  createDraw,
  createUser,
  deleteCharity,
  getActiveSubscribers,
  getDraws,
  getUserByEmail,
  publishDraw,
  updateCharity,
  updateCharitySelection,
  updateScore,
  updateSubscription,
  updateUserProfile,
  updateWinnerStatus,
  upsertWinnerProof
} from "@/lib/db";
import { calculatePrizePools, evaluateWinners, generateDrawNumbers } from "@/lib/prize-engine";
import { slugify } from "@/lib/utils";

function parseMonth(input) {
  const value = String(input || "");
  return /^\d{4}-\d{2}$/.test(value) ? value : new Date().toISOString().slice(0, 7);
}

function safeNextPath(value, fallback) {
  const next = String(value || "");
  return next.startsWith("/") ? next : fallback;
}

export async function registerAction(formData) {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    plan: z.enum(["MONTHLY", "YEARLY"]),
    charityId: z.string().min(1),
    charityPercent: z.coerce.number().min(10).max(100)
  });

  const parsed = schema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    plan: formData.get("plan"),
    charityId: formData.get("charityId"),
    charityPercent: formData.get("charityPercent")
  });
  const next = safeNextPath(formData.get("next"), "/dashboard?message=Welcome+to+Good+Drive+Club");

  if (await getUserByEmail(parsed.email.toLowerCase())) {
    redirect("/subscribe?error=Email+already+exists");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const user = await createUser({
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    passwordHash,
    plan: parsed.plan,
    charityId: parsed.charityId,
    charityPercent: parsed.charityPercent
  });

  await createSession(user.id);
  revalidatePath("/");
  redirect(next);
}

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeNextPath(formData.get("next"), "");
  const user = await getUserByEmail(email);

  if (!user) {
    redirect("/login?error=Invalid+credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    redirect("/login?error=Invalid+credentials");
  }

  await createSession(user.id);
  if (user.role === "ADMIN") {
    redirect("/admin?message=Admin+session+started");
  }
  redirect(next || "/dashboard?message=Welcome+back");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function addScoreAction(formData) {
  const user = await requireUser("SUBSCRIBER");
  const value = Number(formData.get("value"));
  const playedAt = new Date(String(formData.get("playedAt")));

  if (Number.isNaN(value) || value < 1 || value > 45 || Number.isNaN(playedAt.getTime())) {
    redirect("/dashboard?error=Enter+a+score+between+1+and+45+with+a+valid+date");
  }

  await addScore(user.id, value, playedAt.toISOString());
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/dashboard?message=Score+saved+and+rolling+five+updated");
}

export async function updateCharityAction(formData) {
  const user = await requireUser("SUBSCRIBER");
  const charityId = String(formData.get("charityId") || "");
  const percentage = Math.max(10, Number(formData.get("percentage") || 10));
  const independentDonation = Math.max(0, Number(formData.get("independentDonation") || 0));

  await updateCharitySelection(user.id, charityId, percentage, independentDonation);
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard?message=Charity+allocation+updated");
}

export async function supportCharityAction(formData) {
  const user = await getCurrentUser();
  const charityId = String(formData.get("charityId") || "");
  const returnPath = safeNextPath(formData.get("returnPath"), "/dashboard");

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  if (user.role !== "SUBSCRIBER") {
    redirect("/admin?error=Admin+accounts+cannot+use+subscriber+charity+support+actions");
  }

  const percentage = user.charityChoice?.percentage || 10;
  const independentDonation = user.charityChoice?.independentDonation || 0;
  await updateCharitySelection(user.id, charityId, percentage, independentDonation);
  revalidatePath("/dashboard");
  revalidatePath("/charities");
  revalidatePath("/");
  redirect(`${returnPath}${returnPath.includes("?") ? "&" : "?"}message=Charity+support+updated`);
}

export async function updateProfileAction(formData) {
  const user = await requireUser("SUBSCRIBER");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!name || !email) {
    redirect("/dashboard?error=Profile+details+cannot+be+empty");
  }

  const existing = await getUserByEmail(email);
  if (existing && existing.id !== user.id) {
    redirect("/dashboard?error=Email+already+in+use");
  }

  await updateUserProfile(user.id, name, email);
  revalidatePath("/dashboard");
  redirect("/dashboard?message=Profile+updated");
}

export async function submitProofAction(formData) {
  const user = await requireUser("SUBSCRIBER");
  const winnerId = String(formData.get("winnerId") || "");
  const note = String(formData.get("note") || "").trim() || "Screenshot reference submitted for review.";

  await upsertWinnerProof({ userId: user.id, winnerId, note });
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/dashboard?message=Proof+submitted+for+review");
}

export async function editScoreAction(formData) {
  const user = await requireUser("SUBSCRIBER");
  const scoreId = String(formData.get("scoreId") || "");
  const value = Number(formData.get("value"));
  const playedAt = new Date(String(formData.get("playedAt")));
  const ownsScore = user.scores.some((score) => score.id === scoreId);

  if (!ownsScore) {
    redirect("/dashboard?error=Score+record+not+found");
  }

  if (Number.isNaN(value) || value < 1 || value > 45 || Number.isNaN(playedAt.getTime())) {
    redirect("/dashboard?error=Enter+a+valid+score+and+date");
  }

  await updateScore(scoreId, value, playedAt.toISOString());
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/dashboard?message=Score+updated");
}

export async function simulateDrawAction(formData) {
  await requireUser("ADMIN");
  const mode = String(formData.get("mode")) === "ALGORITHM" ? "ALGORITHM" : "RANDOM";
  const month = parseMonth(formData.get("month"));

  const users = await getActiveSubscribers();
  const latestPublishedDraw = (await getDraws()).find((draw) => draw.status === "PUBLISHED");
  const prizePools = calculatePrizePools(
    users.map((user) => user.subscription).filter(Boolean),
    latestPublishedDraw?.jackpotCarry || 0
  );
  const numbers = generateDrawNumbers(mode, users.flatMap((user) => user.scores));
  const winners = evaluateWinners({ users, numbers, pools: prizePools });

  await createDraw({
    month,
    mode,
    status: "DRAFT",
    numbersCsv: numbers.join(","),
    jackpotCarry: latestPublishedDraw?.jackpotCarry || 0,
    winners
  });

  revalidatePath("/admin");
  redirect("/admin?message=Simulation+ready");
}

export async function publishDrawAction(formData) {
  await requireUser("ADMIN");
  const month = parseMonth(formData.get("month"));
  const draws = await getDraws();
  const draft = draws.find((draw) => draw.status === "DRAFT" && draw.month === month);

  if (!draft) {
    redirect("/admin?error=Run+a+simulation+before+publishing");
  }

  const users = await getActiveSubscribers();
  const basePools = calculatePrizePools(
    users.map((user) => user.subscription).filter(Boolean),
    draft.jackpotCarry
  );
  const hasJackpotWinner = draft.winners.some((winner) => winner.tier === "FIVE_MATCH");
  const nextCarry = hasJackpotWinner ? 0 : draft.jackpotCarry + Math.round(basePools.totalContribution * 0.4);

  await publishDraw(draft.id, nextCarry);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/admin?message=Draw+published");
}

export async function updateWinnerStatusAction(formData) {
  await requireUser("ADMIN");
  const winnerId = String(formData.get("winnerId") || "");
  const status = String(formData.get("status") || "PENDING");
  const nextStatus = status === "PAID" ? "PAID" : status === "REJECTED" ? "REJECTED" : "PENDING";

  await updateWinnerStatus(winnerId, nextStatus);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?message=Winner+status+updated");
}

export async function updateSubscriptionAction(formData) {
  await requireUser("ADMIN");
  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "ACTIVE");
  const renewalDate = new Date(String(formData.get("renewalDate") || ""));

  if (Number.isNaN(renewalDate.getTime())) {
    redirect("/admin?error=Enter+a+valid+renewal+date");
  }

  await updateSubscription(userId, status, renewalDate.toISOString());
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?message=Subscription+updated");
}

export async function updateAnyScoreAction(formData) {
  await requireUser("ADMIN");
  const scoreId = String(formData.get("scoreId") || "");
  const value = Number(formData.get("value"));
  const playedAt = new Date(String(formData.get("playedAt") || ""));

  if (Number.isNaN(value) || value < 1 || value > 45 || Number.isNaN(playedAt.getTime())) {
    redirect("/admin?error=Enter+a+valid+score+and+date");
  }

  await updateScore(scoreId, value, playedAt.toISOString());
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?message=Score+updated");
}

export async function createCharityAction(formData) {
  await requireUser("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const eventsCsv = String(formData.get("events") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("|");
  const featured = formData.get("featured") === "on";

  if (!name || !category || !location || !description || !imageUrl) {
    redirect("/admin?error=Complete+all+charity+fields");
  }

  await createCharity({
    name,
    slug: `${slugify(name)}-${Date.now().toString().slice(-5)}`,
    category,
    location,
    description,
    imageUrl,
    eventsCsv,
    featured
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?message=Charity+created");
}

export async function createAdminAction(formData) {
  await requireUser("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!name || !email || password.length < 8) {
    redirect("/admin?error=Admin+name,+email,+and+an+8+character+password+are+required");
  }

  if (await getUserByEmail(email)) {
    redirect("/admin?error=That+email+already+exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await createAdminUser({ name, email, passwordHash });
  revalidatePath("/admin");
  redirect("/admin?message=New+admin+created+securely");
}

export async function updateCharityAdminAction(formData) {
  await requireUser("ADMIN");
  const charityId = String(formData.get("charityId") || "");
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const eventsCsv = String(formData.get("events") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("|");
  const featured = formData.get("featured") === "on";

  if (!charityId || !name || !category || !location || !description || !imageUrl) {
    redirect("/admin?error=Complete+all+charity+fields");
  }

  await updateCharity({
    charityId,
    name,
    slug: `${slugify(name)}-${charityId.slice(0, 5)}`,
    category,
    location,
    description,
    imageUrl,
    eventsCsv,
    featured
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?message=Charity+updated");
}

export async function deleteCharityAction(formData) {
  await requireUser("ADMIN");
  const charityId = String(formData.get("charityId") || "");
  const removed = await deleteCharity(charityId);

  if (!removed) {
    redirect("/admin?error=Cannot+delete+a+charity+that+has+active+subscriber+selections");
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?message=Charity+deleted");
}
