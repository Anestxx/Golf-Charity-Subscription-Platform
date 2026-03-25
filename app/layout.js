import "./globals.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata = {
  title: "Good Drive Club",
  description: "A subscription-based golf charity platform with score tracking, draws, and admin workflows."
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />
        <div className="shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Golf Charity Subscription Platform</p>
              <Link href="/" className="brand">
                Good Drive Club
              </Link>
            </div>
            <nav className="nav">
              <Link href="/">Home</Link>
              <Link href="/charities">Charities</Link>
              <Link href="/subscribe">Subscribe</Link>
              {user?.role === "SUBSCRIBER" ? <Link href="/dashboard">Dashboard</Link> : null}
              {user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
              {user ? (
                <form action={logoutAction}>
                  <SubmitButton className="nav-button" pendingLabel="Signing out...">
                    Logout
                  </SubmitButton>
                </form>
              ) : (
                <Link href="/login" className="nav-button">
                  Login
                </Link>
              )}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
