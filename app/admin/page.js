import {
  createAdminAction,
  createCharityAction,
  deleteCharityAction,
  publishDrawAction,
  simulateDrawAction,
  updateAnyScoreAction,
  updateCharityAdminAction,
  updateSubscriptionAction,
  updateWinnerStatusAction
} from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { getAdminData } from "@/lib/queries";
import { formatCurrency, splitNumbers, tierLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }) {
  await requireUser("ADMIN");
  const [{ users, charities, draws, prizePools, analytics }, params] = await Promise.all([getAdminData(), searchParams]);
  const latestDraft = draws.find((draw) => draw.status === "DRAFT");
  const latestPublished = draws.find((draw) => draw.status === "PUBLISHED");

  return (
    <main className="stack-page">
      <section className="section-heading compact">
        <div>
          <p className="eyebrow">Administrator View - Golf Platform Control</p>
          <h1>Control subscriptions, golf scores, draws, charities, and payouts.</h1>
        </div>
        <div className="pill-row">
          <span className="pill">Live analytics</span>
          <span className="pill muted-pill">{users.length} subscribers</span>
        </div>
      </section>

      {params?.error ? <p className="feedback error">{params.error}</p> : null}
      {params?.message ? <p className="feedback success">{params.message}</p> : null}

      <section className="card-grid four-up">
        <article className="panel stat-panel">
          <strong>{formatCurrency(analytics.totalPrizePool)}</strong>
          <span>Total current prize value</span>
        </article>
        <article className="panel stat-panel">
          <strong>{Object.keys(analytics.charityTotals).length}</strong>
          <span>Charities receiving active support</span>
        </article>
        <article className="panel stat-panel">
          <strong>{analytics.drawStats.totalDraws}</strong>
          <span>Total draw records</span>
        </article>
        <article className="panel stat-panel">
          <strong>{analytics.drawStats.totalWinnerRecords}</strong>
          <span>Winner records tracked</span>
        </article>
      </section>

      <section className="section-grid two-up">
        <article className="panel">
          <h2>Draw management</h2>
          <form action={simulateDrawAction} className="form-grid two-columns">
            <label className="field">
              <span>Draw mode</span>
              <select name="mode" defaultValue="RANDOM">
                <option value="RANDOM">Random</option>
                <option value="ALGORITHM">Algorithmic</option>
              </select>
            </label>
            <label className="field">
              <span>Draw month</span>
              <input name="month" type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
            </label>
            <div className="full-width">
              <SubmitButton className="button button-primary" pendingLabel="Simulating...">
                Run Simulation
              </SubmitButton>
            </div>
          </form>
          {latestDraft ? (
            <div className="draft-box">
              <div className="card-topline">
                <strong>Latest draft: {latestDraft.month}</strong>
                <span className="pill">draft</span>
              </div>
              <div className="number-row">
                {splitNumbers(latestDraft.numbersCsv).map((number) => (
                  <span className="number-ball" key={number}>
                    {number}
                  </span>
                ))}
              </div>
              <p className="muted-copy">{latestDraft.winners.length} winner records would be created from this simulation.</p>
              <form action={publishDrawAction}>
                <input type="hidden" name="month" value={latestDraft.month} />
                <SubmitButton className="button button-secondary" pendingLabel="Publishing...">
                  Publish Draft
                </SubmitButton>
              </form>
            </div>
          ) : null}
          {latestPublished ? (
            <p className="muted-copy">
              Latest published draw: <strong>{latestPublished.month}</strong>
            </p>
          ) : null}
          <div className="divider" />
          <ul className="data-list">
            <li>
              <span>5-match jackpot</span>
              <strong>{formatCurrency(prizePools.fiveMatch)}</strong>
            </li>
            <li>
              <span>4-match pool</span>
              <strong>{formatCurrency(prizePools.fourMatch)}</strong>
            </li>
            <li>
              <span>3-match pool</span>
              <strong>{formatCurrency(prizePools.threeMatch)}</strong>
            </li>
          </ul>
        </article>

        <article className="panel">
          <h2>Create charity</h2>
          <form action={createCharityAction} className="form-grid">
            <label className="field">
              <span>Name</span>
              <input name="name" required />
            </label>
            <label className="field">
              <span>Category</span>
              <input name="category" required />
            </label>
            <label className="field">
              <span>Location</span>
              <input name="location" required />
            </label>
            <label className="field">
              <span>Image URL</span>
              <input name="imageUrl" type="url" required />
            </label>
            <label className="field">
              <span>Events, comma separated</span>
              <input name="events" placeholder="Community Golf Day, Charity Cup" />
            </label>
            <label className="checkbox-field">
              <input name="featured" type="checkbox" />
              <span>Set as featured charity</span>
            </label>
            <label className="field">
              <span>Description</span>
              <textarea name="description" required />
            </label>
            <SubmitButton className="button button-primary" pendingLabel="Creating...">
              Create Charity
            </SubmitButton>
          </form>
        </article>
      </section>

      <section className="section-grid two-up">
        <article className="panel">
          <h2>Create secure admin</h2>
          <p className="muted-copy">
            Public registration can only create subscriber accounts. New admins can only be created by an existing admin from this protected area.
          </p>
          <form action={createAdminAction} className="form-grid">
            <label className="field">
              <span>Admin name</span>
              <input name="name" required />
            </label>
            <label className="field">
              <span>Admin email</span>
              <input name="email" type="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" minLength={8} required />
            </label>
            <SubmitButton className="button button-primary" pendingLabel="Creating admin...">
              Create Admin
            </SubmitButton>
          </form>
        </article>

        <article className="panel">
          <h2>Role boundaries</h2>
          <ul className="data-list">
            <li>
              <span>Public visitor</span>
              <strong>Browse charities and start auth</strong>
            </li>
            <li>
              <span>Registered subscriber</span>
              <strong>Support charities, manage scores, view winnings</strong>
            </li>
            <li>
              <span>Admin</span>
              <strong>Manage users, draws, payouts, and content</strong>
            </li>
          </ul>
        </article>
      </section>

      <section className="section-grid two-up">
        <article className="panel">
          <h2>Winner verification</h2>
          <div className="stack-list">
            {users.flatMap((user) =>
              user.winnings.map((winner) => (
                <article className="inner-card" key={winner.id}>
                  <div className="card-topline">
                    <strong>
                      {user.name} - {tierLabel(winner.tier)}
                    </strong>
                    <span className="pill muted-pill">{winner.status.toLowerCase()}</span>
                  </div>
                  <p className="muted-copy">
                    {winner.draw.month} - {formatCurrency(winner.amount)}
                  </p>
                  <p className="muted-copy">{winner.proof?.note || "No proof note submitted yet."}</p>
                  <form action={updateWinnerStatusAction} className="inline-form">
                    <input type="hidden" name="winnerId" value={winner.id} />
                    <button className="button button-ghost" type="submit" name="status" value="PAID">
                      Mark Paid
                    </button>
                    <button className="button button-ghost" type="submit" name="status" value="REJECTED">
                      Reject
                    </button>
                  </form>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="panel">
          <h2>Reports and charity totals</h2>
          <ul className="data-list">
            <li>
              <span>Published draws</span>
              <strong>{analytics.drawStats.publishedDraws}</strong>
            </li>
            <li>
              <span>Draft draws</span>
              <strong>{analytics.drawStats.draftDraws}</strong>
            </li>
            <li>
              <span>Total users</span>
              <strong>{analytics.totalUsers}</strong>
            </li>
          </ul>
          <div className="divider" />
          <h3>Charity totals</h3>
          <ul className="data-list">
            {Object.entries(analytics.charityTotals).map(([name, total]) => (
              <li key={name}>
                <span>{name}</span>
                <strong>{formatCurrency(total)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>User and subscription management</h2>
        <div className="stack-list">
          {users.map((user) => (
            <article key={user.id} className="inner-card">
              <div className="card-topline">
                <strong>{user.name}</strong>
                <span className="pill muted-pill">{user.charityChoice?.charity?.name || "No charity selected"}</span>
              </div>
              <p className="muted-copy">
                {user.email} - {user.subscription?.status?.toLowerCase()} - {user.scores.length} stored scores
              </p>
              <form action={updateSubscriptionAction} className="form-grid two-columns">
                <input type="hidden" name="userId" value={user.id} />
                <label className="field">
                  <span>Subscription status</span>
                  <select name="status" defaultValue={user.subscription?.status || "ACTIVE"}>
                    <option value="ACTIVE">Active</option>
                    <option value="LAPSED">Lapsed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>
                <label className="field">
                  <span>Renewal date</span>
                  <input
                    name="renewalDate"
                    type="date"
                    defaultValue={new Date(user.subscription?.renewalDate).toISOString().slice(0, 10)}
                  />
                </label>
                <div className="full-width">
                  <SubmitButton className="button button-ghost" pendingLabel="Updating...">
                    Save Subscription
                  </SubmitButton>
                </div>
              </form>
              <div className="divider" />
              <h3>Edit golf scores</h3>
              <div className="stack-list">
                {user.scores.map((score) => (
                  <form key={score.id} action={updateAnyScoreAction} className="inner-card compact-form">
                    <input type="hidden" name="scoreId" value={score.id} />
                    <div className="form-grid two-columns">
                      <label className="field">
                        <span>Score</span>
                        <input name="value" type="number" min="1" max="45" defaultValue={score.value} />
                      </label>
                      <label className="field">
                        <span>Date</span>
                        <input
                          name="playedAt"
                          type="date"
                          defaultValue={new Date(score.playedAt).toISOString().slice(0, 10)}
                        />
                      </label>
                    </div>
                    <SubmitButton className="button button-ghost" pendingLabel="Saving score...">
                      Update Score
                    </SubmitButton>
                  </form>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Charity Directory</p>
            <h2>Edit or remove charities</h2>
          </div>
        </div>
        <div className="card-grid two-up">
          {charities.map((charity) => (
            <article key={charity.id} className="charity-card compact-card">
              <img src={charity.imageUrl} alt={charity.name} className="charity-image" />
              <form action={updateCharityAdminAction} className="form-grid">
                <input type="hidden" name="charityId" value={charity.id} />
                <label className="field">
                  <span>Name</span>
                  <input name="name" defaultValue={charity.name} required />
                </label>
                <label className="field">
                  <span>Category</span>
                  <input name="category" defaultValue={charity.category} required />
                </label>
                <label className="field">
                  <span>Location</span>
                  <input name="location" defaultValue={charity.location} required />
                </label>
                <label className="field">
                  <span>Image URL</span>
                  <input name="imageUrl" type="url" defaultValue={charity.imageUrl} required />
                </label>
                <label className="field">
                  <span>Events, comma separated</span>
                  <input name="events" defaultValue={charity.events.join(", ")} />
                </label>
                <label className="checkbox-field">
                  <input name="featured" type="checkbox" defaultChecked={charity.featured} />
                  <span>Featured</span>
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea name="description" defaultValue={charity.description} required />
                </label>
                <div className="inline-form">
                  <SubmitButton className="button button-primary" pendingLabel="Saving...">
                    Update Charity
                  </SubmitButton>
                </div>
              </form>
              <form action={deleteCharityAction}>
                <input type="hidden" name="charityId" value={charity.id} />
                <SubmitButton className="button button-ghost" pendingLabel="Deleting...">
                  Delete Charity
                </SubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
