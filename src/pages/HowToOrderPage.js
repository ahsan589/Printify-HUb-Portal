import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiMessageSquare, FiPackage, FiUsers } from 'react-icons/fi';

const steps = [
  {
    number: '01',
    title: 'Browse Products',
    text: 'Explore categories on the website and shortlist the products, sizes, quantities, or bundle ideas you like.',
    icon: <FiPackage />,
  },
  {
    number: '02',
    title: 'Visit The Shop',
    text: 'Orders are not placed online. Please visit our shop so we can discuss materials, finishes, quantity, and customization in person.',
    icon: <FiMapPin />,
  },
  {
    number: '03',
    title: 'Share Requirements',
    text: 'Bring your artwork, references, logo files, measurements, or sample ideas. Our team will review everything with you at the shop.',
    icon: <FiMessageSquare />,
  },
  {
    number: '04',
    title: 'Confirm Quote',
    text: 'After finalizing the details, we prepare your quotation, timeline, and production plan before starting the job.',
    icon: <FiUsers />,
  },
];

const notes = [
  'Orders are handled offline at the shop.',
  'Website browsing is for product selection and reference only.',
  'Customization is discussed and finalized in person.',
  'Production starts after order confirmation and quote approval.',
];

export default function HowToOrderPage() {
  return (
    <div className="how-order-page">
      <div className="how-order-shell">
        <section className="how-order-hero">
          <span className="hero-kicker">Visit Shop To Order</span>
          <h1>How To Order</h1>
          <p>
            We do not take orders online. Use the website to browse products, then visit the shop to
            place your order, discuss customization, and confirm your quotation.
          </p>

          <div className="hero-points">
            <div>
              <FiMapPin />
              <span>Shop visit required</span>
            </div>
            <div>
              <FiClock />
              <span>Quotation after discussion</span>
            </div>
          </div>
        </section>

        <section className="how-order-content">
          <div className="steps-panel">
            <div className="section-head">
              <span className="section-kicker">Ordering Process</span>
              <h2>Simple offline ordering in four steps.</h2>
            </div>

            <div className="steps-grid">
              {steps.map((step) => (
                <article key={step.number} className="step-card">
                  <div className="step-top">
                    <span className="step-number">{step.number}</span>
                    <div className="step-icon">{step.icon}</div>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="info-panel">
            <div className="info-card warning">
              <span className="card-kicker">Important</span>
              <h3>Orders are not online</h3>
              <p>
                The website helps you view products and ideas, but the actual order is placed only
                after visiting the shop.
              </p>
            </div>

            <div className="info-card">
              <span className="card-kicker">Before You Visit</span>
              <ul>
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="info-card contact">
              <span className="card-kicker">Need Guidance First?</span>
              <p>
                If you are unsure which product or size is right, contact us first and then visit
                the shop with your requirements.
              </p>
              <div className="contact-actions">
                <Link to="/support" className="primary-link">Contact Support</Link>
                <Link to="/categories" className="secondary-link">Browse Categories</Link>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <style jsx="true">{`
        .how-order-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.12), transparent 24%),
            linear-gradient(180deg, #f7fafe 0%, #ffffff 100%);
          padding: 18px 16px 56px;
          color: #10233f;
        }

        .how-order-shell {
          max-width: 1240px;
          margin: 0 auto;
        }

        .how-order-hero {
          border: 1px solid #d8e2ef;
          border-radius: 30px;
          padding: 34px;
          background: linear-gradient(135deg, #f4f8fd, #fff);
          box-shadow: 0 24px 50px rgba(11, 35, 67, 0.06);
          margin-bottom: 24px;
          animation: fadeUp 0.55s ease;
        }

        .hero-kicker,
        .section-kicker,
        .card-kicker {
          display: inline-block;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #3b6797;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .how-order-hero h1 {
          margin: 0;
          font-size: clamp(2.4rem, 5vw, 4.2rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: #0b2343;
        }

        .how-order-hero p {
          max-width: 70ch;
          margin: 16px 0 0;
          line-height: 1.8;
          color: #60728d;
          font-size: 1.03rem;
        }

        .hero-points {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .hero-points div {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid #d8e2ef;
          color: #10233f;
          font-weight: 700;
        }

        .hero-points svg {
          color: #3b6797;
        }

        .how-order-content {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 22px;
        }

        .steps-panel,
        .info-card {
          background: white;
          border: 1px solid #d8e2ef;
          border-radius: 24px;
          box-shadow: 0 18px 38px rgba(11, 35, 67, 0.05);
        }

        .steps-panel {
          padding: 28px;
        }

        .section-head h2 {
          margin: 0;
          font-size: clamp(1.7rem, 3vw, 2.5rem);
          line-height: 1.08;
          color: #0b2343;
          letter-spacing: -0.03em;
          max-width: 15ch;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .step-card {
          border: 1px solid #dfe8f3;
          border-radius: 22px;
          padding: 20px;
          background: linear-gradient(180deg, #ffffff, #f4f8fd);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          animation: fadeUp 0.45s ease;
        }

        .step-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 28px rgba(11, 35, 67, 0.08);
        }

        .step-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .step-number {
          font-size: 0.9rem;
          font-weight: 800;
          color: #3b6797;
          letter-spacing: 0.12em;
        }

        .step-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #ebf2fb;
          color: #3b6797;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .step-card h3 {
          margin: 0 0 8px;
          color: #0b2343;
        }

        .step-card p {
          margin: 0;
          line-height: 1.7;
          color: #60728d;
        }

        .info-panel {
          display: grid;
          gap: 16px;
          align-self: start;
        }

        .info-card {
          padding: 22px;
          animation: fadeUp 0.45s ease;
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

        .info-card.warning {
          background: linear-gradient(135deg, #eef5fd, #ffffff);
        }

        .info-card.contact {
          background: linear-gradient(135deg, #f8fafc, #ffffff);
        }

        .info-card h3 {
          margin: 0 0 10px;
          color: #0b2343;
        }

        .info-card p {
          margin: 0;
          line-height: 1.75;
          color: #60728d;
        }

        .info-card ul {
          margin: 0;
          padding-left: 18px;
          color: #60728d;
          line-height: 1.9;
        }

        .contact-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .primary-link,
        .secondary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 14px;
          padding: 12px 16px;
          font-weight: 700;
        }

        .primary-link {
          background: linear-gradient(135deg, #0b2343, #335f93);
          color: white;
        }

        .secondary-link {
          border: 1px solid #d8e2ef;
          color: #0b2343;
          background: white;
        }

        @media (max-width: 900px) {
          .how-order-content {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .how-order-page {
            padding: 12px 12px 36px;
          }

          .how-order-hero,
          .steps-panel,
          .info-card {
            padding: 20px;
            border-radius: 22px;
          }

          .contact-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
