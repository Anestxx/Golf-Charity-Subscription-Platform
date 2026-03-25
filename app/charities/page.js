import Link from "next/link";
import { getCharities } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CharitiesPage({ searchParams }) {
  const [charities, params] = await Promise.all([getCharities(), searchParams]);
  const search = String(params?.q || "").trim().toLowerCase();
  const category = String(params?.category || "").trim().toLowerCase();

  const categories = [...new Set(charities.map((charity) => charity.category))];
  const filtered = charities.filter((charity) => {
    const matchesSearch =
      !search ||
      charity.name.toLowerCase().includes(search) ||
      charity.description.toLowerCase().includes(search) ||
      charity.location.toLowerCase().includes(search);
    const matchesCategory = !category || charity.category.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="stack-page">
      <section className="section-heading compact">
        <div>
          <p className="eyebrow">Public Visitor View · Charity Directory</p>
          <h1>Search and filter golf-linked causes and charity profiles.</h1>
        </div>
      </section>

      <section className="panel">
        <form className="form-grid two-columns" method="get">
          <label className="field">
            <span>Search</span>
            <input name="q" defaultValue={params?.q || ""} placeholder="Search by name, place, or mission" />
          </label>
          <label className="field">
            <span>Category</span>
            <select name="category" defaultValue={params?.category || ""}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="full-width">
            <button className="button button-primary" type="submit">
              Apply Filters
            </button>
          </div>
        </form>
      </section>

      <section className="card-grid three-up">
        {filtered.map((charity) => (
          <article className="charity-card" key={charity.id}>
            <img src={charity.imageUrl} alt={charity.name} className="charity-image" />
            <div className="card-topline">
              <h3>{charity.name}</h3>
              {charity.featured ? <span className="pill">Featured</span> : null}
            </div>
            <p>{charity.description}</p>
            <p className="muted-copy">
              {charity.category} - {charity.location}
            </p>
            <Link href={`/charities/${charity.slug}`} className="text-link">
              Open charity profile
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
