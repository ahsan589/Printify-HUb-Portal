import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiStar } from 'react-icons/fi';
import { formatPriceDisplay, isStandardProduct } from '../utils/productHelpers';

const fallbackHero =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80';

const highlights = ['Invitation cards', 'Favor tags', 'Gift packaging'];

const getDisplayText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
};

export default function WeddingSpecialsPage({ products = [], categories = [] }) {
  const weddingCategory = categories.find(
    (cat) =>
      cat.name.toLowerCase().includes('wedding') ||
      cat.name.toLowerCase().includes('marriage') ||
      cat.name.toLowerCase().includes('bridal')
  );

  const weddingProducts = products.filter(
    (product) =>
      isStandardProduct(product) &&
      (product.categoryId === weddingCategory?.id ||
        product.name.toLowerCase().includes('wedding') ||
        product.tags?.includes('wedding'))
  );

  const heroImage = weddingCategory?.image || fallbackHero;

  return (
    <div className="wedding-page">
      <div className="wedding-shell">
        <section className="wedding-hero">
          <div className="hero-copy">
            <span className="hero-kicker">Wedding Specials</span>
            <h1>Elegant wedding print in one simple section.</h1>
            <p>
              Browse printed pieces for invitations, favors, packaging, and event presentation with
              a cleaner and simpler layout.
            </p>

            <div className="hero-highlights">
              {highlights.map((item) => (
                <span key={item}>
                  <FiHeart />
                  {item}
                </span>
              ))}
            </div>

            <div className="hero-actions">
              <Link to="/categories" className="primary-link">
                Browse Categories
              </Link>
              <Link to="/support" className="secondary-link">
                Contact Support
              </Link>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-card">
              <img src={heroImage} alt="Wedding print showcase" />
              <div className="hero-badge">
                <FiStar />
                <span>{weddingProducts.length} products</span>
              </div>
            </div>
          </div>
        </section>

        <section className="wedding-products">
          <div className="section-head">
            <div>
              <span className="section-kicker">Wedding Collection</span>
              <h2>Featured items</h2>
            </div>
            <p>Open any product to view details and pricing.</p>
          </div>

          {weddingProducts.length ? (
            <div className="product-grid">
              {weddingProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="product-card">
                  <div className="product-card-image">
                    <img
                      src={
                        product.images?.[0] ||
                        product.image ||
                        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80'
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className="product-card-body">
                    <h3>{product.name}</h3>
                    <p>{getDisplayText(product.description, 'Premium printed item for wedding events.')}</p>

                    <div className="product-card-footer">
                      <strong>{formatPriceDisplay(product.price)}</strong>
                      <span>
                        View Details <FiArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Wedding Products Found</h3>
              <p>Check back soon for our wedding specials collection.</p>
            </div>
          )}
        </section>
      </div>

      <style jsx="true">{`
        .wedding-page {
          --ink: #10233f;
          --muted: #60728d;
          --line: #d8e2ef;
          --navy: #0b2343;
          --blue: #335f93;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.12), transparent 24%),
            linear-gradient(180deg, #f7fafe 0%, #eef4fb 100%);
          padding: 18px 16px 56px;
          color: var(--ink);
        }

        .wedding-shell {
          max-width: 1240px;
          margin: 0 auto;
        }

        .wedding-hero,
        .wedding-products {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 22px 48px rgba(11, 35, 67, 0.07);
        }

        .wedding-hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          padding: 28px;
          margin-bottom: 22px;
          align-items: center;
        }

        .hero-kicker,
        .section-kicker {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--navy);
          max-width: 12ch;
        }

        .hero-copy p {
          margin: 16px 0 0;
          max-width: 58ch;
          color: var(--muted);
          line-height: 1.8;
        }

        .hero-highlights {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .hero-highlights span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f7fafe;
          border: 1px solid var(--line);
          color: var(--navy);
          font-weight: 700;
        }

        .hero-highlights svg {
          color: var(--blue);
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .primary-link,
        .secondary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 16px;
          padding: 13px 18px;
          font-weight: 800;
        }

        .primary-link {
          background: linear-gradient(135deg, var(--navy), var(--blue));
          color: white;
        }

        .secondary-link {
          border: 1px solid var(--line);
          background: white;
          color: var(--navy);
        }

        .hero-image-card {
          position: relative;
          aspect-ratio: 0.95 / 1;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: 0 20px 42px rgba(11, 35, 67, 0.08);
        }

        .hero-image-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: heroFloat 7s ease-in-out infinite;
        }

        .hero-badge {
          position: absolute;
          left: 16px;
          bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid var(--line);
          color: var(--navy);
          font-weight: 800;
        }

        .hero-badge svg {
          color: var(--blue);
        }

        .wedding-products {
          padding: 24px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 22px;
        }

        .section-head h2 {
          margin: 0;
          color: var(--navy);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .section-head p {
          margin: 0;
          color: var(--muted);
          line-height: 1.75;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          perspective: 1400px;
        }

        .product-card,
        .empty-state {
          border: 1px solid var(--line);
          border-radius: 24px;
          background: white;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
        }

        .product-card {
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .product-card:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-6deg);
          border-color: #bfd2e5;
          box-shadow: 0 24px 42px rgba(11, 35, 67, 0.14);
        }

        .product-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 45%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .product-card:hover::after {
          transform: translateX(130%);
        }

        .product-card-image {
          aspect-ratio: 1 / 0.86;
          overflow: hidden;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
        }

        .product-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-card-image img {
          transform: scale(1.04);
        }

        .product-card-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
          transform: translateZ(16px);
        }

        .product-card-body h3,
        .empty-state h3 {
          margin: 0;
          color: var(--navy);
          font-size: 1rem;
        }

        .product-card-body p,
        .empty-state p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.92rem;
        }

        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .product-card-footer strong {
          color: var(--navy);
          font-size: 0.95rem;
        }

        .product-card-footer span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
          font-weight: 800;
          font-size: 0.86rem;
        }

        .empty-state {
          text-align: center;
          padding: 56px 20px;
        }

        @keyframes heroFloat {
          0%,
          100% {
            transform: scale(1.02) translateY(0);
          }
          50% {
            transform: scale(1.05) translateY(-8px);
          }
        }

        @media (max-width: 960px) {
          .wedding-hero {
            grid-template-columns: 1fr;
          }

          .hero-copy h1 {
            max-width: none;
          }

          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .wedding-page {
            padding: 12px 12px 36px;
          }

          .wedding-hero,
          .wedding-products {
            padding: 20px;
            border-radius: 22px;
          }

          .hero-highlights,
          .hero-actions,
          .product-grid {
            grid-template-columns: 1fr;
          }

          .hero-highlights,
          .hero-actions {
            display: grid;
          }

          .section-head,
          .product-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
