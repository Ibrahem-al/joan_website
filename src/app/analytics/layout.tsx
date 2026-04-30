// Analytics dashboard has its own layout — completely separate from the main site
// No navbar, no footer — standalone page
// Not linked anywhere in the main site (no navbar link, no footer link, no sitemap)
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
