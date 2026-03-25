import { notFound } from "next/navigation";
import Link from "next/link";
import { getCharityBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { supportCharityAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export default async function CharityDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const [charity, user, query] = await Promise.all([getCharityBySlug(slug), getCurrentUser(), searchParams]);

  if (!charity) {
    notFound();
  }

  const returnPath = `/charities/${slug}`;

  return (
    <main className="stack-page">
      <section className="hero-grid detail-grid">
        <article className="hero-panel">
          <p className="eyebrow">Public Visitor View · Charity Profile</p>
          <h1>{charity.name}</h1>
          <p className="hero-copy">{charity.description}</p>
          <div className="pill-row">
            <span className="pill">{charity.category}</span>
            <span className="pill muted-pill">{charity.location}</span>
          </div>
          <div className="feature-list">
            {charity.events.map((event) => (
              <div key={event}>
                <h3>{event}</h3>
                <p>Upcoming golf-day and charity activation for supporters and subscribers.</p>
              </div>
            ))}
          </div>

          {!user ? (
            <div className="cta-row">
              <Link href={`/login?next=${encodeURIComponent(returnPath)}`} className="button button-primary">
                Support This Charity
              </Link>
              <Link href={`/subscribe?charity=${encodeURIComponent(charity.slug)}&next=${encodeURIComponent("/dashboard?message=Welcome+and+charity+selected")}`} className="button button-ghost">
                Subscribe To Support
              </Link>
            </div>
          ) : user.role === "SUBSCRIBER" ? (
            <form action={supportCharityAction} className="form-grid">
              <input type="hidden" name="charityId" value={charity.id} />
              <input type="hidden" name="returnPath" value={returnPath} />
              <SubmitButton className="button button-primary" pendingLabel="Saving support...">
                Support This Charity
              </SubmitButton>
            </form>
          ) : (
            <div className="draft-box">
              <strong>Admin session detected</strong>
              <p className="muted-copy">
                Admin accounts manage the platform but do not act as subscriber charity supporters. Use a subscriber account to support this charity directly.
              </p>
            </div>
          )}
        </article>
        <article className="panel media-panel">
          <img src={charity.imageUrl} alt={charity.name} className="detail-image" />
        </article>
      </section>
      {query?.message ? <p className="feedback success">{query.message}</p> : null}
      <section className="panel">
        <h2>Why it matters</h2>
        <p className="muted-copy">
          This profile gives public visitors the mission context, visuals, and golf-event storytelling the PRD calls for, while keeping the support path close to the impact story.
        </p>
        <Link href="/charities" className="text-link">
          Back to directory
        </Link>
      </section>
    </main>
  );
}
