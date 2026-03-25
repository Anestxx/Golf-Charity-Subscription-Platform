import {
  addScoreAction,
  editScoreAction,
  submitProofAction,
  updateCharityAction,
  updateProfileAction
} from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { getCharities, getDraws } from "@/lib/db";
import { formatCurrency, tierLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
  const [user, charities, draws, params] = await Promise.all([
    requireUser("SUBSCRIBER"),
    getCharities(),
    getDraws(),
    searchParams
  ]);

  const winningsTotal = user.winnings.reduce((sum, winner) => sum + winner.amount, 0);
  const upcomingDraws = draws.filter((draw) => draw.status === "DRAFT").length;
  const enteredDraws = user.winnings.length;

  return (
    <main className="stack-page">
      <section className="section-heading compact">
        <div>
          <p className="eyebrow">Registered Subscriber View · Dashboard</p>
          <h1>{user.name}</h1>
        </div>
        <div className="pill-row">
          <span className="pill">{user.subscription?.status?.toLowerCase()}</span>
          <span className="pill muted-pill">{user.subscription?.plan?.toLowerCase()} plan</span>
          <span className="pill muted-pill">
            renews {new Date(user.subscription?.renewalDate).toLocaleDateString("en-GB")}
          </span>
        </div>
      </section>

      {params?.error ? <p className="feedback error">{params.error}</p> : null}
      {params?.message ? <p className="feedback success">{params.message}</p> : null}

      <section className="card-grid three-up">
        <article className="panel stat-panel">
          <strong>{formatCurrency(winningsTotal)}</strong>
          <span>Total winnings tracked</span>
        </article>
        <article className="panel stat-panel">
          <strong>{enteredDraws}</strong>
          <span>Draws entered with tracked outcomes</span>
        </article>
        <article className="panel stat-panel">
          <strong>{upcomingDraws}</strong>
          <span>Upcoming draft draws awaiting publication</span>
        </article>
      </section>

      <section className="section-grid two-up">
        <article className="panel">
          <h2>Latest five scores</h2>
          <ul className="data-list">
            {user.scores.map((score) => (
              <li key={score.id}>
                <span>{new Date(score.playedAt).toLocaleDateString("en-GB")}</span>
                <strong>{score.value} pts</strong>
              </li>
            ))}
          </ul>
          <div className="divider" />
          <form action={addScoreAction} className="form-grid two-columns">
            <label className="field">
              <span>Stableford score</span>
              <input name="value" type="number" min="1" max="45" required />
            </label>
            <label className="field">
              <span>Score date</span>
              <input name="playedAt" type="date" required />
            </label>
            <div className="full-width">
              <SubmitButton className="button button-primary" pendingLabel="Saving score...">
                Add Score
              </SubmitButton>
            </div>
          </form>
          <div className="divider" />
          <h3>Edit stored scores</h3>
          <div className="stack-list">
            {user.scores.map((score) => (
              <form key={score.id} action={editScoreAction} className="inner-card compact-form">
                <input type="hidden" name="scoreId" value={score.id} />
                <div className="form-grid two-columns">
                  <label className="field">
                    <span>Score</span>
                    <input name="value" type="number" min="1" max="45" defaultValue={score.value} required />
                  </label>
                  <label className="field">
                    <span>Date</span>
                    <input
                      name="playedAt"
                      type="date"
                      defaultValue={new Date(score.playedAt).toISOString().slice(0, 10)}
                      required
                    />
                  </label>
                </div>
                <SubmitButton className="button button-ghost" pendingLabel="Updating...">
                  Update Score
                </SubmitButton>
              </form>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Settings and charity allocation</h2>
          <form action={updateProfileAction} className="form-grid">
            <label className="field">
              <span>Full name</span>
              <input name="name" defaultValue={user.name} required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" defaultValue={user.email} required />
            </label>
            <SubmitButton className="button button-ghost" pendingLabel="Saving profile...">
              Save Profile
            </SubmitButton>
          </form>
          <div className="divider" />
          <p className="muted-copy">
            Current charity: <strong>{user.charityChoice?.charity?.name}</strong>
          </p>
          <form action={updateCharityAction} className="form-grid">
            <label className="field">
              <span>Charity</span>
              <select name="charityId" defaultValue={user.charityChoice?.charityId}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Contribution percentage</span>
              <input name="percentage" type="number" min="10" max="100" defaultValue={user.charityChoice?.percentage || 10} />
            </label>
            <label className="field">
              <span>Independent monthly donation</span>
              <input
                name="independentDonation"
                type="number"
                min="0"
                step="1"
                defaultValue={user.charityChoice?.independentDonation || 0}
              />
            </label>
            <SubmitButton className="button button-secondary" pendingLabel="Updating charity...">
              Save Charity Settings
            </SubmitButton>
          </form>
        </article>
      </section>

      <section className="panel">
        <h2>Participation and winnings</h2>
        <div className="card-grid two-up">
          <article className="inner-card">
            <strong>Participation summary</strong>
            <ul className="data-list">
              <li>
                <span>Published draws with recorded result</span>
                <strong>{enteredDraws}</strong>
              </li>
              <li>
                <span>Upcoming draws in admin draft state</span>
                <strong>{upcomingDraws}</strong>
              </li>
              <li>
                <span>Pending payouts</span>
                <strong>{user.winnings.filter((winner) => winner.status === "PENDING").length}</strong>
              </li>
            </ul>
          </article>
          <article className="inner-card">
            <strong>Winner verification</strong>
            <p className="muted-copy">Submit or update score proof only for winning records.</p>
          </article>
        </div>
        <div className="divider" />
        <div className="card-grid two-up">
          {user.winnings.map((winner) => (
            <article key={winner.id} className="inner-card">
              <div className="card-topline">
                <strong>{tierLabel(winner.tier)}</strong>
                <span className="pill muted-pill">{winner.status.toLowerCase()}</span>
              </div>
              <p className="muted-copy">
                {winner.draw.month} - {formatCurrency(winner.amount)}
              </p>
              <form action={submitProofAction} className="form-grid">
                <input type="hidden" name="winnerId" value={winner.id} />
                <label className="field">
                  <span>Proof note or screenshot reference</span>
                  <textarea name="note" defaultValue={winner.proof?.note || ""} />
                </label>
                <SubmitButton className="button button-ghost" pendingLabel="Submitting...">
                  {winner.proof ? "Update Proof" : "Submit Proof"}
                </SubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
