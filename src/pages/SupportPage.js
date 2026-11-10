import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiMapPin,
  FiPackage,
  FiPhoneCall,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const supportCards = [
  {
    icon: <FaWhatsapp />,
    title: 'WhatsApp Support',
    text: 'Fastest way to ask about pricing, quantities, turnaround, or custom print options.',
    actionLabel: 'Chat on WhatsApp',
    href: 'https://wa.me/923101788571?text=Hello%2C%20I%20need%20help%20with%20a%20printing%20order.',
    external: true,
    featured: true,
  },
  {
    icon: <FiMapPin />,
    title: 'Visit The Shop',
    text: 'We finalize orders offline at the shop after discussing material, size, finish, and quantity.',
    actionLabel: 'How To Order',
    to: '/how-to-order',
  },
  {
    icon: <FiPackage />,
    title: 'Browse Products',
    text: 'Use the site to shortlist packaging, cards, stickers, labels, and bundle ideas before visiting.',
    actionLabel: 'Explore Categories',
    to: '/categories',
  },
];

const faqs = [
  {
    question: 'Can I place my order directly on the website?',
    answer:
      'No. The website is for browsing products and collecting ideas. Orders are confirmed offline after visiting the shop and discussing requirements.',
  },
  {
    question: 'What should I bring when visiting for an order?',
    answer:
      'Bring your artwork, logo files, measurements, quantity estimate, references, and any sample ideas that help explain the job.',
  },
  {
    question: 'How do I ask for a quote?',
    answer:
      'You can start on WhatsApp for initial guidance, then visit the shop so the team can finalize specifications and prepare the quotation.',
  },
  {
    question: 'Do you handle custom sizes and branding?',
    answer:
      'Yes. Custom sizes, logos, colors, text, and packaging details are discussed with the team before production starts.',
  },
  {
    question: 'When does production begin?',
    answer:
      'Production begins after the order details are confirmed and the quote is approved.',
  },
  {
    question: 'What kind of products can I ask support about?',
    answer:
      'Support can guide you on packaging, stickers, labels, tags, office stationery, bundles, wedding print, and other custom print work.',
  },
];

const quickSteps = [
  'Browse the website and shortlist the products you like.',
  'Message support if you need guidance before visiting.',
  'Visit the shop with artwork, logo files, sizes, or sample references.',
  'Confirm your quote, timeline, and customization details.',
];

export default function SupportPage() {
  return (
    <div className="support-page">
      <div className="support-shell">
        <section className="support-hero">
          <div className="support-hero-copy">
            <span className="hero-kicker">Help Center</span>
            <h1>Proper support for quotes, artwork, and print order guidance.</h1>
            <p>
              Ask about products, bundle options, customization, materials, turnaround, and order
              preparation. We help you browse online first, then guide you toward the right offline
              order process.
            </p>

            <div className="hero-actions">
              <a
                href="https://wa.me/923101788571?text=Hello%2C%20I%20need%20help%20with%20printing%20or%20packaging."
                target="_blank"
                rel="noreferrer"
                className="primary-link"
              >
                <FaWhatsapp /> WhatsApp Support
              </a>
              <Link to="/how-to-order" className="secondary-link">
                How To Order
              </Link>
            </div>

            <div className="hero-points">
              <div>
                <FiClock />
                <span>Quick pre-order guidance</span>
              </div>
              <div>
                <FiFileText />
                <span>Quote after discussion</span>
              </div>
              <div>
                <FiMapPin />
                <span>Offline order confirmation</span>
              </div>
            </div>
          </div>

          <div className="support-hero-side">
            <div className="info-card emphasis">
              <span className="card-kicker">Best First Step</span>
              <h2>Message us before visiting if you need help choosing the right product.</h2>
              <p>
                We can point you toward the right category, bundle, or print format so your shop
                visit is faster and more productive.
              </p>
            </div>

            <div className="mini-grid">
              <div className="info-card mini">
                <FiHelpCircle />
                <strong>Artwork guidance</strong>
              </div>
              <div className="info-card mini">
                <FiPhoneCall />
                <strong>WhatsApp inquiry support</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="support-card-grid">
          {supportCards.map((item) => (
            <article key={item.title} className={`support-card ${item.featured ? 'featured' : ''}`}>
              <div className="support-card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>

              {item.external ? (
                <a href={item.href} target="_blank" rel="noreferrer" className="support-link">
                  {item.actionLabel} <FiArrowRight />
                </a>
              ) : (
                <Link to={item.to} className="support-link">
                  {item.actionLabel} <FiArrowRight />
                </Link>
              )}
            </article>
          ))}
        </section>

        <section className="support-content">
          <div className="faq-panel">
            <div className="section-head">
              <span className="section-kicker">Frequently Asked Questions</span>
              <h2>Answers to the questions most customers ask before ordering.</h2>
            </div>

            <div className="faq-list">
              {faqs.map((item) => (
                <article key={item.question} className="faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="support-sidebar">
            <div className="info-card">
              <span className="card-kicker">Quick Contact</span>
              <h3>Need help right now?</h3>
              <p>
                Send your requirement on WhatsApp with product name, quantity, size, and any logo or
                artwork notes you already have.
              </p>
              <a
                href="https://wa.me/923101788571?text=Hello%2C%20I%20need%20help%20with%20a%20custom%20printing%20job."
                target="_blank"
                rel="noreferrer"
                className="primary-link full"
              >
                <FaWhatsapp /> Start WhatsApp Chat
              </a>
            </div>

            <div className="info-card">
              <span className="card-kicker">Before You Visit</span>
              <ul className="check-list">
                {quickSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="info-card dark-card">
              <span className="card-kicker">Next Step</span>
              <h3>Ready to explore the catalog first?</h3>
              <p>
                Check categories and bundles, shortlist what you like, then come back here if you
                want help deciding.
              </p>
              <div className="sidebar-actions">
                <Link to="/categories" className="secondary-link light">
                  Browse Categories
                </Link>
                <Link to="/bundles" className="secondary-link light">
                  View Bundles
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <style jsx="true">{`
        .support-page {
          --bg: #eef4fb;
          --paper: #ffffff;
          --ink: #10233f;
          --muted: #60728d;
          --line: #d8e2ef;
          --navy: #0b2343;
          --navy-soft: #17385f;
          --blue: #3b6797;
          --blue-soft: #ebf2fb;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.14), transparent 24%),
            linear-gradient(180deg, #f7fafe 0%, #eef4fb 100%);
          padding: 18px 16px 56px;
          color: var(--ink);
        }

        .support-shell {
          max-width: 1240px;
          margin: 0 auto;
        }

        .support-hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 22px;
          margin-bottom: 22px;
        }

        .support-hero-copy,
        .support-card,
        .faq-panel,
        .info-card {
          border: 1px solid var(--line);
          border-radius: 28px;
          box-shadow: 0 24px 54px rgba(11, 35, 67, 0.07);
        }

        .support-hero-copy {
          background: linear-gradient(145deg, var(--navy), var(--navy-soft));
          color: white;
          padding: 34px;
          animation: fadeUp 0.55s ease;
        }

        .hero-kicker,
        .section-kicker,
        .card-kicker {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .hero-kicker,
        .support-hero .card-kicker {
          color: #b7d0ea;
        }

        .support-hero-copy h1 {
          margin: 0;
          font-size: clamp(2.4rem, 4vw, 4.4rem);
          line-height: 0.98;
          letter-spacing: -0.04em;
          max-width: 12ch;
        }

        .support-hero-copy p {
          margin: 18px 0 0;
          max-width: 60ch;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.8;
        }

        .hero-actions,
        .sidebar-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .primary-link,
        .secondary-link,
        .support-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 800;
          transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
        }

        .primary-link {
          background: white;
          color: var(--navy);
          padding: 13px 18px;
        }

        .primary-link.full {
          width: 100%;
          margin-top: 18px;
        }

        .secondary-link {
          background: rgba(255, 255, 255, 0.08);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 13px 18px;
        }

        .secondary-link.light {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.16);
          color: white;
        }

        .support-link:hover,
        .primary-link:hover,
        .secondary-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(11, 35, 67, 0.18);
        }

        .hero-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
        }

        .hero-points div {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-points svg {
          color: #b7d0ea;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .hero-points span {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          font-size: 0.92rem;
        }

        .support-hero-side {
          display: grid;
          gap: 16px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.92);
          padding: 24px;
          animation: fadeUp 0.45s ease;
        }

        .info-card.emphasis {
          background: linear-gradient(180deg, #ffffff, #f4f8fd);
        }

        .info-card.emphasis h2 {
          margin: 0;
          font-size: clamp(1.8rem, 2.7vw, 2.5rem);
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: var(--navy);
          max-width: 14ch;
        }

        .info-card p {
          margin: 12px 0 0;
          color: var(--muted);
          line-height: 1.75;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .info-card.mini {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          min-height: 150px;
        }

        .info-card.mini svg {
          font-size: 1.4rem;
          color: var(--blue);
        }

        .info-card.mini strong {
          color: var(--navy);
          line-height: 1.5;
        }

        .support-card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 22px;
        }

        .support-card {
          background: rgba(255, 255, 255, 0.92);
          padding: 24px;
          animation: fadeUp 0.45s ease;
        }

        .support-card.featured {
          background: linear-gradient(135deg, #f7fbff, #ffffff);
        }

        .support-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--blue-soft);
          color: var(--blue);
          font-size: 1.35rem;
          margin-bottom: 16px;
        }

        .support-card h3,
        .faq-item h3,
        .info-card h3 {
          margin: 0;
          color: var(--navy);
        }

        .support-card p,
        .faq-item p {
          color: var(--muted);
          line-height: 1.75;
        }

        .support-link {
          margin-top: 18px;
          justify-content: flex-start;
          color: var(--blue);
        }

        .support-content {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 22px;
        }

        .faq-panel {
          background: rgba(255, 255, 255, 0.92);
          padding: 28px;
        }

        .section-kicker,
        .card-kicker {
          color: var(--blue);
        }

        .section-head h2 {
          margin: 0;
          font-size: clamp(1.8rem, 3vw, 2.7rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: var(--navy);
          max-width: 15ch;
        }

        .faq-list {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        .faq-item {
          padding: 20px 0;
          border-bottom: 1px solid var(--line);
          animation: fadeUp 0.4s ease;
        }

        .faq-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .faq-item h3 {
          margin-bottom: 8px;
          font-size: 1.06rem;
        }

        .support-sidebar {
          display: grid;
          gap: 16px;
          align-self: start;
        }

        .check-list {
          margin: 14px 0 0;
          padding-left: 18px;
          color: var(--muted);
          line-height: 1.9;
        }

        .dark-card {
          background: linear-gradient(145deg, var(--navy), var(--navy-soft));
          border-color: transparent;
        }

        .dark-card h3,
        .dark-card .card-kicker {
          color: white;
        }

        .dark-card p {
          color: rgba(255, 255, 255, 0.78);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1000px) {
          .support-hero,
          .support-content,
          .support-card-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .support-page {
            padding: 12px 12px 36px;
          }

          .support-hero-copy,
          .faq-panel,
          .support-card,
          .info-card {
            padding: 20px;
            border-radius: 22px;
          }

          .hero-points,
          .mini-grid {
            grid-template-columns: 1fr;
          }

          .hero-actions,
          .sidebar-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
