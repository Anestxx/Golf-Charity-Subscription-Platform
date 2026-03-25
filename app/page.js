import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getHomepageData } from "@/lib/queries";
import { formatCurrency, splitCsv, splitNumbers } from "@/lib/utils";

export const dynamic = "force-dynamic";

function MetricCard({ value, label }) {
  return (
    <article className="glass metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export default async function HomePage() {
  const [homepageData, currentUser] = await Promise.all([getHomepageData(), getCurrentUser()]);
  const { charities, featuredCharity, latestPublishedDraw, heroStats, prizePools } = homepageData;
  const drawNumbers = splitNumbers(latestPublishedDraw?.numbersCsv || "");
  const joinHref = currentUser ? (currentUser.role === "ADMIN" ? "/admin" : "/dashboard") : "/subscribe";

  return (
    <main className="stack-page">
      <section className="hero-grid">
        <article className="hero-panel">
          <p className="eyebrow">Public Visitor View · Golf-first impact</p>
          <h1>Performance, generosity, and monthly anticipation in one membership.</h1>
          <p className="hero-copy">
            Subscribe on a monthly or yearly plan, maintain your latest five Stableford golf scores, support a charity
            you care about, and stay in the running for monthly golf prize draws with jackpot rollover.
          </p>
          <div className="cta-row">
            <Link href={joinHref} className="button button-primary">
              Join The Club
            </Link>
            <Link href="/charities" className="button button-ghost">
              Explore Charities
            </Link>
          </div>
          {featuredCharity ? (
            <div className="spotlight-card">
              <span className="pill">Featured charity</span>
              <h3>{featuredCharity.name}</h3>
              <p>{featuredCharity.description}</p>
              <Link href={`/charities/${featuredCharity.slug}`} className="text-link">
                View charity profile
              </Link>
            </div>
          ) : null}
        </article>
        <aside className="metrics-grid">
          <MetricCard value={heroStats.subscriberCount} label="Active subscribers powering the current pool" />
          <MetricCard value={formatCurrency(heroStats.monthlyPrizePool)} label="Fresh monthly prize contribution" />
          <MetricCard value={formatCurrency(heroStats.charityImpact)} label="Projected monthly charity impact" />
          <MetricCard value={formatCurrency(heroStats.jackpotCarry)} label="Current 5-match rollover" />
        </aside>
      </section>

      <section className="section-grid two-up">
        <article className="panel">
          <p className="eyebrow">How It Works</p>
          <h2>One clean loop from signup to draw day.</h2>
          <div className="feature-list">
            <div>
              <h3>Subscribe</h3>
              <p>Choose a monthly or yearly membership and set your starting charity percentage from 10% upward.</p>
            </div>
            <div>
              <h3>Track Golf Scores</h3>
              <p>Add Stableford golf scores with dates. The platform automatically retains only the latest five entries.</p>
            </div>
            <div>
              <h3>Enter Monthly Golf Draws</h3>
              <p>Admin can simulate random or algorithmic draws before publishing official monthly golf draw numbers.</p>
            </div>
          </div>
        </article>
        <article className="panel highlight-panel">
          <p className="eyebrow">Prize Logic</p>
          <h2>Automated tiered pools with rollover.</h2>
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
          {latestPublishedDraw ? (
            <>
              <div className="divider" />
              <span className="pill">Latest published draw</span>
              <div className="number-row">
                {drawNumbers.map((number) => (
                  <span className="number-ball" key={number}>
                    {number}
                  </span>
                ))}
              </div>
              <p className="muted-copy">
                {latestPublishedDraw.month} - {String(latestPublishedDraw.mode).toLowerCase()} mode - published results
              </p>
            </>
          ) : null}
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Charity Directory</p>
            <h2>Lead with impact and human stories.</h2>
          </div>
          <p className="section-copy">
            Search, filter, spotlight, and individual charity pages are now part of the public visitor experience.
          </p>
        </div>
        <div className="card-grid three-up">
          {charities.map((charity) => (
            <article className="charity-card" key={charity.id}>
              <img src={charity.imageUrl} alt={charity.name} className="charity-image" />
              <div className="card-topline">
                <h3>{charity.name}</h3>
                {charity.featured ? <span className="pill">Spotlight</span> : null}
              </div>
              <p>{charity.description}</p>
              <p className="muted-copy">
                {charity.category} - {charity.location}
              </p>
              <ul className="mini-list">
                {splitCsv(charity.eventsCsv).map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
              <Link href={`/charities/${charity.slug}`} className="text-link">
                View full profile
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
