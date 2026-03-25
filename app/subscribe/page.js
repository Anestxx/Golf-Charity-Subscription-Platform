import { registerAction } from "@/app/actions";
import { getCharities } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export default async function SubscribePage({ searchParams }) {
  const [charities, params] = await Promise.all([getCharities(), searchParams]);
  const selectedCharity =
    charities.find((charity) => charity.slug === params?.charity || charity.id === params?.charity)?.id || charities[0]?.id || "";

  return (
    <main className="single-column">
      <section className="auth-shell wide">
        <article className="panel auth-panel">
          <p className="eyebrow">Subscription</p>
          <h1>Create a real subscriber account with golf-only access.</h1>
          <p className="hero-copy">
            Public registration always creates a subscriber account. Admin accounts are created separately through secure admin controls.
          </p>
          {params?.error ? <p className="feedback error">{params.error}</p> : null}
          <form action={registerAction} className="form-grid two-columns">
            <input type="hidden" name="next" value={params?.next || ""} />
            <label className="field">
              <span>Full name</span>
              <input name="name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" minLength={6} required />
            </label>
            <label className="field">
              <span>Charity contribution %</span>
              <input name="charityPercent" type="number" min="10" max="100" defaultValue="15" required />
            </label>
            <label className="field">
              <span>Plan</span>
              <select name="plan" defaultValue="MONTHLY">
                <option value="MONTHLY">Monthly - {formatCurrency(29)}</option>
                <option value="YEARLY">Yearly - {formatCurrency(299)}</option>
              </select>
            </label>
            <label className="field">
              <span>Selected charity</span>
              <select name="charityId" defaultValue={selectedCharity}>
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="full-width">
              <SubmitButton className="button button-primary" pendingLabel="Creating account...">
                Start Membership
              </SubmitButton>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
