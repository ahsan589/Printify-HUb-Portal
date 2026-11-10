import { FiArrowRight, FiLayers, FiSearch, FiTag } from 'react-icons/fi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatPriceDisplay } from '../utils/productHelpers';

const getDisplayText = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
};

const getProductImage = (product) =>
  product.images?.[0] ||
  product.image ||
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80';

export default function SearchPage({ products, categories }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const normalized = query.trim().toLowerCase();

  const results = products.filter((product) => {
    if (!normalized) return false;
    const category = categories.find((cat) => cat.id === product.categoryId);
    const categoryName = category ? category.name.toLowerCase() : '';
    return (
      product.name.toLowerCase().includes(normalized) ||
      categoryName.includes(normalized) ||
      (product.sku && product.sku.toLowerCase().includes(normalized))
    );
  });

  const highlightedCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(normalized || '__no_match__')
  );

  return (
    <div className="search-page">
      <div className="search-shell">
        <section className="search-hero">
          <div className="search-hero-copy">
            <span className="search-kicker">Search The Catalog</span>
            <h1>Find packaging, print products, bundles, and category matches faster.</h1>
            <p>
              Search through business cards, stickers, labels, packaging bundles, and more with a cleaner
              browsing experience.
            </p>

            <form
              className="search-form-panel"
              onSubmit={(event) => {
                event.preventDefault();
                const value = new FormData(event.currentTarget).get('q');
                const nextQuery = value?.toString().trim() || '';
                if (!nextQuery) {
                  navigate('/search');
                  return;
                }
                navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
              }}
            >
              <FiSearch />
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search boxes, cards, labels, stickers, bundles..."
              />
              <button type="submit">Search Now</button>
            </form>

            <div className="search-stats">
              <article>
                <strong>{results.length}</strong>
                <span>Products found</span>
              </article>
              <article>
                <strong>{highlightedCategories.length}</strong>
                <span>Category matches</span>
              </article>
              <article>
                <strong>{products.length}+</strong>
                <span>Items in catalog</span>
              </article>
            </div>
          </div>

          <div className="search-hero-side">
            <div className="search-summary-card">
              <span>Current Search</span>
              <strong>{query ? `"${query}"` : 'Start by typing a product name'}</strong>
              <p>
                {query
                  ? `Showing the best product matches and related categories for ${query}.`
                  : 'Use the search box to explore packaging, stationery, bundles, and more.'}
              </p>
            </div>

            <div className="search-tip-card">
              <FiLayers />
              <div>
                <strong>Helpful idea</strong>
                <p>Try category names like "packaging", "stickers", or "office stationery".</p>
              </div>
            </div>
          </div>
        </section>

        {highlightedCategories.length ? (
          <section className="category-match-strip">
            <div className="section-head compact">
              <div>
                <span className="search-kicker">Related Categories</span>
                <h2>Browse matching sections</h2>
              </div>
            </div>

            <div className="category-match-grid">
              {highlightedCategories.slice(0, 4).map((category) => (
                <Link key={category.id} to={`/categories/${category.id}`} className="category-match-card">
                  <div className="category-match-image">
                    {category.image ? <img src={category.image} alt={category.name} /> : <span>{category.name[0]}</span>}
                  </div>
                  <div>
                    <strong>{category.name}</strong>
                    <p>{getDisplayText(category.description, 'Explore matching products in this section.')}</p>
                  </div>
                  <span className="inline-chip">
                    Open <FiArrowRight />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="results-panel">
          <div className="section-head">
            <div>
              <span className="search-kicker">Results</span>
              <h2>{query ? `Matches for "${query}"` : 'Search results will appear here'}</h2>
              <p>
                {query
                  ? `We found ${results.length} product${results.length === 1 ? '' : 's'} based on your search.`
                  : 'Enter a keyword above to browse the catalog in a more focused way.'}
              </p>
            </div>
          </div>

          {!query.trim() ? (
            <div className="empty-state rich-empty-state">
              <FiSearch />
              <h3>Search for something specific</h3>
              <p>Try terms like business cards, labels, stickers, wedding, or packaging bundle.</p>
            </div>
          ) : results.length ? (
            <div className="search-grid">
              {results.map((product) => {
                const category = categories.find((cat) => cat.id === product.categoryId);

                return (
                  <article key={product.id} className="search-card">
                    <div className="search-card-media">
                      <img src={getProductImage(product)} alt={product.name} />
                    </div>

                    <div className="search-card-body">
                      <div className="search-card-tags">
                        <span>
                          <FiTag />
                          {category?.name || product.category || 'Printing'}
                        </span>
                        {product.sku ? <span className="sku-chip">{product.sku}</span> : null}
                      </div>

                      <h3>{product.name}</h3>
                      <p>{getDisplayText(product.description, 'Premium print and packaging product.')}</p>

                      <div className="search-card-footer">
                        <strong>{formatPriceDisplay(product.price)}</strong>
                        <Link className="search-link" to={`/product/${product.id}`}>
                          View Details <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state rich-empty-state">
              <FiLayers />
              <h3>No products matched "{query}"</h3>
              <p>Try a broader term, check spelling, or browse categories to find a closer match.</p>
              <Link to="/categories" className="empty-link">
                Browse Categories <FiArrowRight />
              </Link>
            </div>
          )}
        </section>
      </div>

      <style jsx="true">{`
        .search-page {
          --bg: #eef4fb;
          --paper: rgba(255, 255, 255, 0.92);
          --ink: #10233f;
          --muted: #60728d;
          --line: #d8e2ef;
          --deep: #0b2343;
          --blue: #335f93;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.15), transparent 24%),
            linear-gradient(180deg, #f7fafe 0%, #eef4fb 100%);
          min-height: 100vh;
          padding: 18px 16px 56px;
          color: var(--ink);
        }

        .search-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .search-hero,
        .results-panel,
        .category-match-strip {
          border: 1px solid var(--line);
          border-radius: 30px;
          background: var(--paper);
          box-shadow: 0 24px 60px rgba(11, 35, 67, 0.07);
        }

        .search-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
          gap: 24px;
          padding: 32px;
          margin-bottom: 24px;
          overflow: hidden;
          position: relative;
          animation: fadeUp 0.55s ease;
        }

        .search-hero::before {
          content: '';
          position: absolute;
          inset: auto -80px -120px auto;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(51, 95, 147, 0.18), transparent 68%);
          pointer-events: none;
        }

        .search-kicker {
          display: inline-block;
          margin-bottom: 14px;
          color: var(--blue);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.76rem;
          font-weight: 800;
        }

        .search-hero-copy h1,
        .section-head h2 {
          margin: 0;
          color: var(--deep);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .search-hero-copy h1 {
          font-size: clamp(2.3rem, 4vw, 4.2rem);
          max-width: 11ch;
        }

        .search-hero-copy p,
        .section-head p,
        .search-summary-card p,
        .search-tip-card p,
        .category-match-card p,
        .search-card-body p,
        .empty-state p {
          color: var(--muted);
          line-height: 1.7;
        }

        .search-hero-copy p {
          margin: 18px 0 0;
          max-width: 62ch;
        }

        .search-form-panel {
          margin-top: 24px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 12px 14px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .search-form-panel svg {
          color: var(--blue);
          font-size: 1.15rem;
        }

        .search-form-panel input {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: var(--ink);
          min-width: 0;
        }

        .search-form-panel button,
        .search-link,
        .empty-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
        }

        .search-form-panel button,
        .search-link,
        .empty-link {
          background: linear-gradient(135deg, var(--deep), var(--blue));
          color: white;
          font-weight: 800;
          padding: 12px 18px;
          box-shadow: 0 16px 30px rgba(11, 35, 67, 0.16);
        }

        .search-form-panel button:hover,
        .search-link:hover,
        .empty-link:hover {
          transform: translateY(-2px);
        }

        .search-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .search-stats article,
        .search-summary-card,
        .search-tip-card {
          border: 1px solid var(--line);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.88);
        }

        .search-stats article {
          padding: 16px;
        }

        .search-stats strong {
          display: block;
          font-size: 1.4rem;
          color: var(--deep);
        }

        .search-stats span {
          color: var(--muted);
          font-size: 0.92rem;
        }

        .search-hero-side {
          display: grid;
          gap: 14px;
          align-content: center;
        }

        .search-summary-card {
          padding: 24px;
          background: linear-gradient(160deg, #f4f8fd, #ffffff);
        }

        .search-summary-card span {
          display: inline-block;
          margin-bottom: 10px;
          color: var(--blue);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 800;
        }

        .search-summary-card strong {
          display: block;
          color: var(--deep);
          font-size: 1.4rem;
          line-height: 1.3;
        }

        .search-tip-card {
          padding: 18px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .search-tip-card svg {
          color: var(--blue);
          font-size: 1.3rem;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .search-tip-card strong,
        .category-match-card strong,
        .search-card-body h3,
        .empty-state h3 {
          color: var(--deep);
        }

        .category-match-strip,
        .results-panel {
          padding: 28px;
        }

        .category-match-strip {
          margin-bottom: 24px;
          animation: fadeUp 0.65s ease;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 22px;
        }

        .section-head.compact {
          margin-bottom: 18px;
        }

        .section-head h2 {
          font-size: clamp(1.8rem, 3vw, 2.7rem);
        }

        .section-head p {
          margin: 10px 0 0;
          max-width: 58ch;
        }

        .category-match-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          perspective: 1400px;
        }

        .category-match-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          position: relative;
          border-radius: 22px;
          text-decoration: none;
          border: 1px solid var(--line);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 248, 253, 0.95));
          overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: cardReveal 0.6s ease both;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
        }

        .category-match-card:hover,
        .search-card:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-6deg);
          border-color: #bfd2e5;
          box-shadow: 0 24px 42px rgba(11, 35, 67, 0.14);
        }

        .category-match-card::after,
        .search-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 45%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .category-match-card:hover::after,
        .search-card:hover::after {
          transform: translateX(130%);
        }

        .category-match-image {
          height: 150px;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-match-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .category-match-image span {
          font-size: 2rem;
          font-weight: 800;
          color: var(--blue);
        }

        .category-match-card p,
        .search-card-body p,
        .empty-state p,
        .search-summary-card p,
        .search-tip-card p {
          margin: 6px 0 0;
        }

        .inline-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--blue);
          font-weight: 700;
        }

        .results-panel {
          animation: fadeUp 0.75s ease;
        }

        .search-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          perspective: 1400px;
        }

        .search-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
          transform-style: preserve-3d;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: cardReveal 0.6s ease both;
        }

        .search-card:hover {
          border-color: #bfd2e5;
        }

        .search-card-media {
          height: 190px;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          overflow: hidden;
        }

        .search-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .category-match-card:hover .category-match-image img,
        .search-card:hover .search-card-media img {
          transform: scale(1.04);
        }

        .search-card-body {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
          position: relative;
          z-index: 1;
          transform: translateZ(16px);
        }

        .category-match-grid > * {
          animation-delay: calc(var(--stagger, 0) * 0.08s);
        }

        .search-grid > * {
          animation-delay: calc(var(--stagger, 0) * 0.08s);
        }

        .category-match-grid > *:nth-child(1),
        .search-grid > *:nth-child(1) {
          --stagger: 1;
        }

        .category-match-grid > *:nth-child(2),
        .search-grid > *:nth-child(2) {
          --stagger: 2;
        }

        .category-match-grid > *:nth-child(3),
        .search-grid > *:nth-child(3) {
          --stagger: 3;
        }

        .category-match-grid > *:nth-child(4),
        .search-grid > *:nth-child(4) {
          --stagger: 4;
        }

        .category-match-grid > *:nth-child(5),
        .search-grid > *:nth-child(5) {
          --stagger: 5;
        }

        .category-match-grid > *:nth-child(6),
        .search-grid > *:nth-child(6) {
          --stagger: 6;
        }

        .search-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .search-card-tags span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 999px;
          background: #edf4fc;
          color: var(--blue);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .sku-chip {
          background: rgba(11, 35, 67, 0.08) !important;
          color: var(--deep) !important;
        }

        .search-card-body h3 {
          margin: 0;
          line-height: 1.35;
          font-size: 1rem;
        }

        .search-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .search-card-footer strong {
          color: var(--deep);
          font-size: 0.95rem;
        }

        .empty-state {
          border: 1px dashed var(--line);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 253, 0.96));
          text-align: center;
        }

        .rich-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 44px 20px;
        }

        .rich-empty-state svg {
          color: var(--blue);
          font-size: 1.7rem;
        }

        .rich-empty-state h3 {
          margin: 0;
          font-size: 1.5rem;
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

        @media (max-width: 980px) {
          .search-hero {
            grid-template-columns: 1fr;
          }

          .category-match-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .search-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .search-page {
            padding: 12px 12px 36px;
          }

          .search-hero,
          .category-match-strip,
          .results-panel {
            padding: 20px;
            border-radius: 24px;
          }

          .search-form-panel {
            grid-template-columns: 1fr;
          }

          .search-form-panel svg {
            display: none;
          }

          .search-stats,
          .category-match-grid {
            grid-template-columns: 1fr;
          }

          .search-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .search-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 420px) {
          .search-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
