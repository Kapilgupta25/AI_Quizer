import { Link } from 'react-router-dom';

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/kapil_gupta25/?hl=en',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
        <circle cx="12" cy="12" r="4.25" />
        <circle cx="17.3" cy="6.7" r="0.9" className="fill-current stroke-none" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kapil-gupta-a41216289/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M6.75 8.2H3.5V20.5h3.25V8.2Zm-1.63-5A1.87 1.87 0 1 0 5.13 6.94 1.87 1.87 0 0 0 5.12 3.2ZM20.5 13.06c0-3.7-1.97-5.42-4.6-5.42a4.03 4.03 0 0 0-3.63 2.01V8.2H9.02c.04.96 0 12.3 0 12.3h3.25v-6.87c0-.37.03-.73.14-.99a2.13 2.13 0 0 1 2-1.42c1.43 0 2 1.08 2 2.68v6.6h3.24v-7.44Z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Kapilgupta25',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 2.5a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.84c-2.72.59-3.29-1.15-3.29-1.15a2.59 2.59 0 0 0-1.09-1.42c-.89-.6.07-.59.07-.59a2.06 2.06 0 0 1 1.5 1.01 2.1 2.1 0 0 0 2.87.82 2.1 2.1 0 0 1 .62-1.32c-2.17-.25-4.45-1.09-4.45-4.83A3.77 3.77 0 0 1 6.9 9.1a3.5 3.5 0 0 1 .1-2.5s.82-.26 2.69 1a9.24 9.24 0 0 1 4.9 0c1.87-1.25 2.69-1 2.69-1a3.49 3.49 0 0 1 .1 2.5 3.76 3.76 0 0 1 1 2.61c0 3.75-2.28 4.58-4.46 4.82a2.35 2.35 0 0 1 .67 1.83v2.71c0 .26.18.56.68.47A9.75 9.75 0 0 0 12 2.5Z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Create Room', to: '/create' },
  { label: 'Join Room', to: '/join' },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-surface-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-display font-semibold uppercase tracking-[0.35em] text-brand-300">
                AIQuizer
              </p>
              <h2 className="mt-3 text-2xl font-display font-bold text-white">
                Made by Kapil Gupta
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/60">
              AIQuizer helps friends jump into fast, real-time quiz battles with AI-generated questions.
              For collaborations, feedback, bug reports, or project inquiries, contact Kapil through the
              social profiles below.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                  aria-label={link.name}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold uppercase tracking-[0.25em] text-white/45">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3 text-sm text-white/70">
              {quickLinks.map((link) => (
                <Link key={link.label} to={link.to} className="footer-text-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold uppercase tracking-[0.25em] text-white/45">
              Contact
            </h3>
            <div className="card p-5 space-y-3">
              <p className="text-sm text-white/65 leading-6">
                Reach out to Kapil for development work, product feedback, or support with AIQuizer.
              </p>
              <a href="mailto:kapilg.work@gmail.com" className="footer-text-link inline-flex">
                <span>Email :</span> kapilg.work@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} AIQuizer. All rights reserved.</p>
          <p>Designed and maintained by Kapil.</p>
        </div>
      </div>
    </footer>
  );
}
