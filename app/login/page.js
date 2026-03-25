import { loginAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return (
    <main className="single-column">
      <section className="auth-shell">
        <article className="panel auth-panel">
          <p className="eyebrow">Login</p>
          <h1>Open the working product.</h1>
          <p className="hero-copy">
            Subscriber demo: <strong>maya@example.com / demo123</strong>
            <br />
            Admin demo: <strong>admin@example.com / admin123</strong>
          </p>
          {params?.error ? <p className="feedback error">{params.error}</p> : null}
          {params?.message ? <p className="feedback success">{params.message}</p> : null}
          <form action={loginAction} className="form-grid">
            <input type="hidden" name="next" value={params?.next || ""} />
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input name="password" type="password" required />
            </label>
            <SubmitButton className="button button-primary" pendingLabel="Signing in...">
              Login
            </SubmitButton>
          </form>
        </article>
      </section>
    </main>
  );
}
