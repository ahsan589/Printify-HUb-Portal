import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiStar } from 'react-icons/fi';
import { formatPriceDisplay } from '../utils/productHelpers';

const defaultHero =
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80';

const getDisplayText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
};

export default function CategoryShowcasePage({
  title,
  subtitle,
  heroImage,
  products = [],
  emptyTitle = 'No Products Found',
  emptyText = 'Check back soon for products in this section.',
  heroDescription,
  highlights = ['Custom designs', 'Fast turnaround', 'Premium quality'],
  showActions = true,
  primaryLinkText = 'Browse Categories',
  primaryLinkTo = '/categories',
  secondaryLinkText = 'Contact Support',
  secondaryLinkTo = '/support',
}) {
  const description =
    heroDescription ||
    subtitle ||
    'Discover premium print & packaging solutions tailored for your business needs.';

  return (
    <div className="category-page">
      <div className="category-shell">
        <section className="category-hero">
          <div className="hero-copy">
            <span className="hero-kicker">Category Showcase</span>
            <h1>{title}</h1>
            <p>{description}</p>

            <div className="hero-highlights">
              {highlights.map((item) => (
                <span key={item}>
                  <FiHeart />
                  {item}
                </span>
              ))}
            </div>

            {showActions && (
              <div className="hero-actions">
                <Link to={primaryLinkTo} className="primary-link">
                  {primaryLinkText}
                </Link>
                <Link to={secondaryLinkTo} className="secondary-link">
                  {secondaryLinkText}
                </Link>
              </div>
            )}
          </div>

          <div className="hero-media">
            <div className="hero-image-card">
              <img src={heroImage || defaultHero} alt={title} />
              <div className="hero-badge">
                <FiStar />
                <span>{products.length} products</span>
              </div>
            </div>
          </div>
        </section>

        <section className="category-products">
          <div className="section-head">
            <div>
              <span className="section-kicker">Collection</span>
              <h2>Featured items</h2>
            </div>
            <p>Open any product to view details and pricing.</p>
          </div>

          {products.length ? (
            <div className="product-grid">
              {products.map((product, index) => (
                <Link key={product.id} to={`/product/${product.id}`} className="product-card" style={{ '--stagger': index + 1 }}>
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
                    <p>
                      {getDisplayText(
                        product.description,
                        'Premium custom printing and packaging item.'
                      )}
                    </p>

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
              <h3>{emptyTitle}</h3>
              <p>{emptyText}</p>
              <Link to="/categories" className="browse-btn">
                Browse All Categories
              </Link>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .category-page {
          --primary: #3b82f6;
          --accent: #f8fafc;
          --ink: #1e293b;
          --muted: #64748b;
          --line: #e2e8f0;
          --shadow: rgba(0, 0, 0, 0.04);
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 30%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 24px 20px 64px;
          color: var(--ink);
        }

        .category-shell {
          max-width: 1320px;
          margin: 0 auto;
        }

        .category-hero,
        .category-products {
          border: 1px solid var(--line);
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 25px 50px var(--shadow);
        }

        .category-hero {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 32px;
          padding: 48px;
          margin-bottom: 28px;
          align-items: center;
        }

        .hero-kicker,
        .section-kicker {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--primary);
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(2.6rem, 5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--ink);
          max-width: 14ch;
        }

        .hero-copy p {
          margin: 16px 0 0;
          max-width: 58ch;
          color: var(--muted);
          line-height: 1.8;
        }

        .hero-highlights {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .hero-highlights span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--ink);
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .hero-highlights svg {
          color: var(--primary);
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .primary-link,
        .secondary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 16px;
          padding: 14px 20px;
          font-weight: 800;
          transition: all 0.3s ease;
        }

        .primary-link {
          background: linear-gradient(135deg, var(--primary), #1d4ed8);
          color: white;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }

        .primary-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
        }

        .secondary-link {
          border: 1px solid var(--line);
          background: white;
          color: var(--ink);
        }

        .hero-media {
          position: relative;
        }

        .hero-image-card {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: 0 25px 50px var(--shadow);
          transition: transform 0.4s ease;
        }

        .hero-image-card:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .hero-image-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: heroFloat 6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          transition: transform 0.4s ease;
        }

        .hero-image-card:hover img {
          transform: scale(1.05);
        }

        .hero-badge {
          position: absolute;
          left: 16px;
          bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--line);
          color: var(--ink);
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .hero-badge svg {
          color: var(--primary);
        }

        .category-products {
          padding: 32px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: end;
          margin-bottom: 28px;
        }

        .section-head h2 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(2rem, 3.5vw, 2.8rem);
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
          gap: 20px;
          perspective: 1200px;
        }

        .product-card,
        .empty-state {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: white;
          box-shadow: 0 20px 40px var(--shadow);
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        .product-grid > *:nth-child(1) { animation-delay: 0.1s; }
        .product-grid > *:nth-child(2) { animation-delay: 0.2s; }
        .product-grid > *:nth-child(3) { animation-delay: 0.3s; }
        .product-grid > *:nth-child(4) { animation-delay: 0.4s; }
        .product-grid > *:nth-child(5) { animation-delay: 0.5s; }
        .product-grid > *:nth-child(6) { animation-delay: 0.6s; }

        .product-card {
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .product-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: var(--primary);
          box-shadow: 0 35px 60px rgba(59, 130, 246, 0.15);
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
          background: linear-gradient(135deg, #f1f5f9, #ffffff);
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
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 10px;
        }

        .product-card-body h3,
        .empty-state h3 {
          margin: 0;
          color: var(--ink);
          font-size: 1.05rem;
        }

        .product-card-body p,
        .empty-state p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.94rem;
        }

        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }

        .product-card-footer strong {
          color: var(--ink);
          font-size: 1rem;
          font-weight: 800;
        }

        .product-card-footer span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-weight: 800;
          font-size: 0.88rem;
        }

        .empty-state {
          text-align: center;
          padding: 64px 28px;
        }

        .browse-btn {
          display: inline-block;
          margin-top: 24px;
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--primary), #1d4ed8);
          color: white;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }

        @keyframes heroFloat {
          0%, 20% { 
            transform: translate3d(0, 0, 0) rotate(0deg); 
          }
          40% { 
            transform: translate3d(-4px, -6px, 0) rotate(-1deg); 
          }
          60% { 
            transform: translate3d(4px, -4px, 0) rotate(1deg); 
          }
          80%, 100% { 
            transform: translate3d(0, 0, 0) rotate(0deg); 
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 900px) {
          .category-hero {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 36px;
          }

          .hero-copy h1 {
            max-width: none;
          }

          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .category-page {
            padding: 16px 16px 48px;
          }

          .category-hero,
          .category-products {
            padding: 28px;
            border-radius: 24px;
          }

          .hero-highlights,
          .hero-actions {
            display: grid;
            gap: 12px;
          }

          .section-head,
          .product-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .product-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

