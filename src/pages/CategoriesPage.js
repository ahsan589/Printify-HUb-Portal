import { FiArrowRight, FiGrid, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const getDisplayText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
};

export default function CategoriesPage({ categories = [] }) {
  return (
    <div className="categories-page">
      <div className="categories-shell">
        <section className="categories-hero">
          <span className="hero-kicker">Product Categories</span>
          <h1>Choose the section that matches what you want to print.</h1>
          <p>
            Browse all product sections in one simple place. Open a category to see the products
            inside it, then continue to product details or contact support if you need help.
          </p>

          <div className="hero-stats">
            <article>
              <FiGrid />
              <div>
                <strong>{categories.length}</strong>
                <span>Categories</span>
              </div>
            </article>
            <article>
              <FiLayers />
              <div>
                <strong>Simple</strong>
                <span>Browsing flow</span>
              </div>
            </article>
          </div>
        </section>

        <section className="categories-content">
          <div className="section-head">
            <div>
              <span className="section-kicker">All Sections</span>
              <h2>Browse categories</h2>
            </div>
            <p>Clean category cards with less visual clutter and clearer spacing.</p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.id} to={`/categories/${category.id}`} className="category-card">
                <div className="category-image">
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <div className="category-placeholder">{category.name?.charAt(0) || 'C'}</div>
                  )}
                </div>

                <div className="category-body">
                  <span className="category-tag">Category</span>
                  <h3>{category.name}</h3>
                  <p>{getDisplayText(category.description, 'Browse products in this category.')}</p>
                  <div className="category-footer">
                    <span>Open Category</span>
                    <FiArrowRight />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .categories-page {
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

        .categories-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .categories-hero,
        .categories-content {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 22px 48px rgba(11, 35, 67, 0.07);
        }

        .categories-hero {
          padding: 30px;
          margin-bottom: 22px;
          animation: fadeUp 0.55s ease;
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

        .categories-hero h1 {
          margin: 0;
          font-size: clamp(2.2rem, 4vw, 3.8rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--navy);
          max-width: 12ch;
        }

        .categories-hero p {
          margin: 16px 0 0;
          max-width: 68ch;
          color: var(--muted);
          line-height: 1.8;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
          max-width: 460px;
        }

        .hero-stats article {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 16px;
          border-radius: 20px;
          background: #f7fafe;
          border: 1px solid var(--line);
        }

        .hero-stats svg {
          color: var(--blue);
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .hero-stats strong {
          display: block;
          color: var(--navy);
        }

        .hero-stats span {
          color: var(--muted);
          font-size: 0.88rem;
        }

        .categories-content {
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
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .section-head p {
          margin: 0;
          color: var(--muted);
          line-height: 1.75;
          max-width: 48ch;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          perspective: 1400px;
        }

        .category-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          background: white;
          transform-style: preserve-3d;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: cardReveal 0.6s ease both;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
        }

        .category-card:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-6deg);
          border-color: #bfd2e5;
          box-shadow: 0 24px 42px rgba(11, 35, 67, 0.14);
        }

        .category-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 45%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .category-card:hover::after {
          transform: translateX(130%);
        }

        .category-card:hover .category-image img {
          transform: scale(1.04);
        }

        .category-image {
          height: 220px;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          overflow: hidden;
        }

        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .category-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          color: var(--blue);
        }

        .category-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
          position: relative;
          z-index: 1;
          transform: translateZ(16px);
        }

        .category-grid > * {
          animation-delay: calc(var(--stagger, 0) * 0.08s);
        }

        .category-grid > *:nth-child(1) {
          --stagger: 1;
        }

        .category-grid > *:nth-child(2) {
          --stagger: 2;
        }

        .category-grid > *:nth-child(3) {
          --stagger: 3;
        }

        .category-grid > *:nth-child(4) {
          --stagger: 4;
        }

        .category-grid > *:nth-child(5) {
          --stagger: 5;
        }

        .category-grid > *:nth-child(6) {
          --stagger: 6;
        }

        .category-tag {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          background: #ebf2fb;
          color: var(--blue);
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .category-body h3 {
          margin: 0;
          color: var(--navy);
          line-height: 1.35;
        }

        .category-body p {
          margin: 0;
          color: var(--muted);
          line-height: 1.7;
          font-size: 0.92rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .category-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--line);
          color: var(--blue);
          font-weight: 800;
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

        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 1100px) {
          .category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 560px) {
          .categories-page {
            padding: 12px 12px 36px;
          }

          .categories-hero,
          .categories-content {
            padding: 20px;
            border-radius: 22px;
          }

          .hero-stats,
          .category-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
