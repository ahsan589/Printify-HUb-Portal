import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBox, FiLayers } from 'react-icons/fi';
import { formatCurrency, formatPriceDisplay, isBundleProduct } from '../utils/productHelpers';

const getDisplayText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
};

export default function BundlesPage({ products, categories }) {
  const bundleProducts = useMemo(
    () =>
      products.filter((product) => {
        if (isBundleProduct(product)) return true;
        const category = categories.find((item) => item.id === product.categoryId);
        return category?.name?.toLowerCase().includes('bundle');
      }),
    [products, categories]
  );

  const bundleGroups = useMemo(() => {
    const groups = new Map();

    bundleProducts.forEach((product) => {
      const key = (product.bundleGroup || 'All Bundles').trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(product);
    });

    return Array.from(groups.entries()).map(([name, items]) => ({
      name,
      items,
    }));
  }, [bundleProducts]);

  const [activeGroup, setActiveGroup] = useState('all');

  const visibleGroups =
    activeGroup === 'all'
      ? bundleGroups
      : bundleGroups.filter((group) => group.name === activeGroup);

  const startingPrice = useMemo(() => {
    const prices = bundleProducts
      .map((product) => product.price)
      .filter((price) => typeof price === 'number' && Number.isFinite(price));

    return prices.length ? Math.min(...prices) : null;
  }, [bundleProducts]);

  return (
    <div className="bundles-page">
      <div className="bundles-shell">
        <section className="bundles-hero">
          <span className="hero-kicker">Ready-Made Bundles</span>
          <h1>Simple bundle offers for faster ordering.</h1>
          <p>
            Choose a bundle group, open the option you like, and send an inquiry for pricing,
            quantity, or customization. This page is kept simple so it is easier to browse.
          </p>

          <div className="hero-stats">
            <article>
              <FiBox />
              <div>
                <strong>{bundleProducts.length}</strong>
                <span>Bundle products</span>
              </div>
            </article>
            <article>
              <FiLayers />
              <div>
                <strong>{bundleGroups.length}</strong>
                <span>Bundle groups</span>
              </div>
            </article>
            <article>
              <div>
                <strong>{startingPrice ? formatCurrency(startingPrice) : 'Inquiry'}</strong>
                <span>Starting price</span>
              </div>
            </article>
          </div>
        </section>

        <section className="bundles-content">
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip ${activeGroup === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGroup('all')}
            >
              All Bundles
            </button>
            {bundleGroups.map((group) => (
              <button
                key={group.name}
                type="button"
                className={`filter-chip ${activeGroup === group.name ? 'active' : ''}`}
                onClick={() => setActiveGroup(group.name)}
              >
                {group.name}
              </button>
            ))}
          </div>

          {visibleGroups.length ? (
            <div className="group-stack">
              {visibleGroups.map((group) => (
                <section key={group.name} className="bundle-group">
                  <div className="group-head">
                    <div>
                      <span className="group-kicker">Bundle Group</span>
                      <h2>{group.name}</h2>
                    </div>
                    <span className="group-count">{group.items.length} items</span>
                  </div>

                  <div className="bundle-card-grid">
                    {group.items.map((product) => (
                      <Link key={product.id} to={`/product/${product.id}`} className="bundle-card">
                        <div className="bundle-card-image">
                          <img
                            src={
                              product.images?.[0] ||
                              product.image ||
                              'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80'
                            }
                            alt={product.name}
                          />
                        </div>

                        <div className="bundle-card-body">
                          <span className="bundle-card-tag">{group.name}</span>
                          <h3>{product.name}</h3>
                          <p>
                            {getDisplayText(
                              product.discountText || product.shortNote || product.description,
                              'Open bundle details to see included items and request custom quantities.'
                            )}
                          </p>

                          <div className="bundle-card-footer">
                            <strong>
                              {formatPriceDisplay(product.price)}
                            </strong>
                            <span>
                              View Details <FiArrowRight />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No bundles added yet</h2>
              <p>Add bundle-type products from admin and they will appear here automatically.</p>
            </div>
          )}
        </section>
      </div>

      <style jsx="true">{`
        .bundles-page {
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

        .bundles-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .bundles-hero,
        .bundle-group,
        .empty-state {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 22px 48px rgba(11, 35, 67, 0.07);
        }

        .bundles-hero {
          padding: 30px;
          margin-bottom: 22px;
          animation: fadeUp 0.55s ease;
        }

        .hero-kicker,
        .group-kicker {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .bundles-hero h1 {
          margin: 0;
          font-size: clamp(2.2rem, 4vw, 3.8rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--navy);
        }

        .bundles-hero p {
          margin: 16px 0 0;
          max-width: 68ch;
          color: var(--muted);
          line-height: 1.8;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
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
          font-size: 1.1rem;
        }

        .hero-stats span {
          color: var(--muted);
          font-size: 0.88rem;
        }

        .bundles-content {
          padding: 24px;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
        }

        .filter-chip {
          border: 1px solid var(--line);
          background: white;
          color: var(--ink);
          border-radius: 999px;
          padding: 12px 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s ease;
        }

        .filter-chip.active {
          background: linear-gradient(135deg, var(--navy), var(--blue));
          color: white;
          border-color: transparent;
        }

        .group-stack {
          display: grid;
          gap: 18px;
        }

        .bundle-group {
          padding: 22px;
          animation: fadeUp 0.45s ease;
        }

        .group-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 18px;
        }

        .group-head h2 {
          margin: 0;
          color: var(--navy);
          font-size: clamp(1.6rem, 2.6vw, 2.2rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .group-count {
          flex-shrink: 0;
          padding: 8px 12px;
          border-radius: 999px;
          background: #ebf2fb;
          color: var(--blue);
          font-size: 0.85rem;
          font-weight: 800;
        }

        .bundle-card-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          perspective: 1400px;
        }

        .bundle-card {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          background: white;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: fadeUp 0.45s ease;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
        }

        .bundle-card:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-6deg);
          border-color: #bfd2e5;
          box-shadow: 0 24px 42px rgba(11, 35, 67, 0.14);
        }

        .bundle-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 45%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .bundle-card:hover::after {
          transform: translateX(130%);
        }

        .bundle-card-image {
          height: 220px;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          overflow: hidden;
        }

        .bundle-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .bundle-card:hover .bundle-card-image img {
          transform: scale(1.04);
        }

        .bundle-card-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
          transform: translateZ(16px);
        }

        .bundle-card-tag {
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

        .bundle-card-body h3 {
          margin: 0;
          color: var(--navy);
          line-height: 1.35;
        }

        .bundle-card-body p {
          margin: 0;
          color: var(--muted);
          line-height: 1.7;
          font-size: 0.92rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bundle-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .bundle-card-footer strong {
          color: var(--navy);
          font-size: 0.95rem;
        }

        .bundle-card-footer span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
          font-weight: 800;
        }

        .empty-state {
          padding: 56px 20px;
          text-align: center;
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

        .empty-state h2 {
          margin: 0;
          color: var(--navy);
        }

        .empty-state p {
          margin: 10px 0 0;
          color: var(--muted);
        }

        @media (max-width: 980px) {
          .bundle-card-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .bundles-page {
            padding: 12px 12px 36px;
          }

          .bundles-hero,
          .bundles-content,
          .bundle-group {
            padding: 20px;
            border-radius: 22px;
          }

          .hero-stats,
          .bundle-card-grid {
            grid-template-columns: 1fr;
          }

          .group-head,
          .bundle-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
