// src/pages/HomePage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiLayers,
  FiPackage,
  FiSearch,
  FiShield,
  FiStar,
  FiTruck,
  FiCheckCircle,
  FiThumbsUp,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import useStoreData from '../hooks/useStoreData';
import { formatCurrency, formatPriceDisplay, isBundleProduct } from '../utils/productHelpers';

// Static fallback slides (used if no categories available)
const staticHeroSlides = [
  {
    eyebrow: 'Wedding Card Printing',
    title: 'Elegant wedding cards and event stationery for memorable celebrations.',
    text: 'From invitation cards to thank-you inserts and coordinated wedding print sets, we help you create polished pieces that feel premium and personal.',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
    accent: '#1d4c84',
    topLabel: 'Wedding Favorite',
    topText: 'Invites, inserts, and premium card finishes',
    bottomLabel: 'Custom Orders',
    bottomText: 'Matching sets for events and celebrations',
  },
  {
    eyebrow: 'Printable Mugs & Gifts',
    title: 'Custom mugs and gift printing that turn simple items into branded keepsakes.',
    text: 'Perfect for giveaways, office gifting, and personalized orders with vibrant printing that stands out on mugs, accessories, and event merchandise.',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=80',
    accent: '#335f93',
    topLabel: 'Gift Printing',
    topText: 'Personalized mugs and branded merchandise',
    bottomLabel: 'Bulk Friendly',
    bottomText: 'Great for events, teams, and corporate gifting',
  },
  {
    eyebrow: 'Shirt & Apparel Printing',
    title: 'Printed shirts and apparel designed for brands, teams, and promotions.',
    text: 'Build eye-catching apparel with custom shirt printing for uniforms, startup branding, merch drops, and promotional campaigns.',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1200&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80',
    accent: '#0b2343',
    topLabel: 'Apparel Print',
    topText: 'Custom shirts for teams, shops, and campaigns',
    bottomLabel: 'Brand Ready',
    bottomText: 'Reliable quality for repeat apparel orders',
  },
];

// Helper: get a product image for a given category
function getProductImageForCategory(category, products) {
  if (!products?.length) return null;
  const product = products.find(p => p.categoryId === category.id);
  if (product && product.images?.length) {
    return product.images[0];
  }
  return null;
}

function resolveHeroSlides(categories, products) {
  const heroCategories = categories; // Show all categories cycling in slider
  if (heroCategories.length === 0) {
    return staticHeroSlides.map(slide => ({ ...slide, image: slide.image }));
  }

  const categorySlides = heroCategories.map((category, index) => {
    const accents = ['#1d4c84', '#335f93', '#0b2343'];
    const slide = staticHeroSlides[index % staticHeroSlides.length]; // Base structure

    // Get a product image from this category (if any)
    const productImage = getProductImageForCategory(category, products);
    const secondaryImage = productImage || category.image || slide.secondaryImage;

    return {
      ...slide,
      eyebrow: category.name || 'Featured Category',
      title: category.name || 'Explore Category',
      text: getDisplayText(category.description, 'Discover premium products in this category.'),
      image: category.image || slide.image,
      secondaryImage,
      accent: accents[index % accents.length],
      topLabel: 'Featured',
      topText: getDisplayText(category.description?.slice(0, 50), 'Premium products'),
      bottomLabel: 'Shop Now',
      bottomText: 'Browse full collection',
    };
  });

  // Pad with static if fewer than 3 categories
  while (categorySlides.length < 3) {
    const staticSlide = staticHeroSlides[categorySlides.length % staticHeroSlides.length];
    categorySlides.push({
      ...staticSlide,
      image: staticSlide.image,
      secondaryImage: staticSlide.secondaryImage,
    });
  }

  return categorySlides;
}

const servicePillars = [
  {
    icon: <FiPackage />,
    title: 'Custom Packaging',
    text: 'Boxes, sleeves, mailers, inserts, and retail-ready packaging for every product category.',
  },
  {
    icon: <FiLayers />,
    title: 'Brand Print',
    text: 'Business cards, brochures, tags, thank you cards, and marketing collateral with sharp finishing.',
  },
  {
    icon: <FiTruck />,
    title: 'Bulk Production',
    text: 'Dependable large-volume printing with support for repeat orders and growing brands.',
  },
  {
    icon: <FiShield />,
    title: 'Quality Control',
    text: 'Consistent materials, cleaner output, and better presentation so your products feel polished.',
  },
];

function getDisplayText(value, fallback) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined') {
    return fallback;
  }
  return text;
}

function SectionHeading({ kicker, title, text, action }) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {action || null}
    </div>
  );
}

function Hero({ slide, motionTick, onSearch, searchValue, onSearchChange, onSearchFocus, onSearchBlur }) {
  const motionClass = motionTick % 2 === 0 ? 'motion-a' : 'motion-b';

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className={`hero-copy-motion ${motionClass}`}>
          <span className="hero-kicker">{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.text}</p>
        </div>

        <form
          className="hero-search"
          onSubmit={(event) => {
            event.preventDefault();
            const query = new FormData(event.currentTarget).get('q');
            onSearch(query?.toString() || '');
          }}
        >
          <FiSearch />
          <input
            name="q"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder="Search packaging, stickers, boxes, cards..."
          />
          <button type="submit">Search</button>
        </form>

        <div className="hero-actions">
          <Link to="/categories" className="primary-link">
            Explore Categories <FiArrowRight />
          </Link>
          <Link to="/bundles" className="secondary-link">
            View Bundles
          </Link>
        </div>

        <div className="hero-metrics">
          <div>
            <strong>500+</strong>
            <span>Projects delivered</span>
          </div>
          <div>
            <strong>20+</strong>
            <span>Print categories</span>
          </div>
          <div>
            <strong>Bulk</strong>
            <span>Startup to enterprise</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-stack">
          <div className={`hero-image-wrap ${motionClass}`} style={{ '--accent': slide.accent }}>
            <div className="hero-image-glow" />
            <img src={slide.image} alt={slide.title} />
            <div className="hero-card hero-card-top">
              <span>{slide.topLabel || 'Top Pick'}</span>
              <strong>{slide.topText || 'Premium packaging bundles'}</strong>
            </div>
            <div className="hero-card hero-card-bottom">
              <span>{slide.bottomLabel || 'Inquiry Friendly'}</span>
              <strong>{slide.bottomText || 'Quick WhatsApp quote support'}</strong>
            </div>
          </div>

          <div className={`hero-landscape-wrap ${motionClass}`} style={{ '--accent': slide.accent }}>
            <img src={slide.secondaryImage} alt={`${slide.title} showcase`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ categories }) {
  const items = useMemo(() => categories.slice(0, 8), [categories]);

  return (
    <section className="content-section">
      <SectionHeading
        kicker="Shop By Category"
        title="Start with the section that matches your business."
        text="Clean entry points for packaging, wedding print, labels, stationery, and more."
      />

      <div className="category-grid">
        {items.map((category) => (
          <Link key={category.id} to={`/categories/${category.id}`} className="category-tile">
            <div className="category-image-shell">
              {category.image ? (
                <img src={category.image} alt={category.name} />
              ) : (
                <div className="category-fallback">{category.name?.charAt(0) || 'C'}</div>
              )}
            </div>
            <div className="category-tile-copy">
              <h3>{category.name}</h3>
              <p>{getDisplayText(category.description, 'Browse products in this category.')}</p>
            </div>
            <span className="inline-link-explore">
              Explore <FiArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSpotlight({ products }) {
  const items = useMemo(() => products.filter((item) => !isBundleProduct(item)).slice(0, 8), [products]);

  return (
    <section className="content-section alt-panel">
      <SectionHeading
        kicker="Featured Products"
        title="Popular print and packaging picks."
        text="A tighter, cleaner product grid with quick paths into detail pages."
        action={
          <Link to="/categories" className="ghost-link">
            Browse All <FiArrowRight />
          </Link>
        }
      />

      <div className="product-grid">
        {items.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="product-tile">
            <div className="product-media">
              <img
                src={
                  product.images?.[0] ||
                  product.image ||
                  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
                }
                alt={product.name}
              />
            </div>
            <div className="product-copy">
              <span className="product-tag">{product.category || 'Printing'}</span>
              <h3>{product.name}</h3>
              <p>{getDisplayText(product.description, 'Premium quality print and packaging product.')}</p>
              <div className="product-footer">
                <strong>{formatPriceDisplay(product.price)}</strong>
                <span className="inline-link">
                  Details <FiArrowRight />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BundleSpotlight({ products }) {
  const bundles = useMemo(() => products.filter((item) => isBundleProduct(item)).slice(0, 3), [products]);

  return (
    <section className="content-section bundle-panel">
      <SectionHeading
        kicker="Ready-Made Bundles"
        title="Bundle offers designed for fast brand setup."
        text="Perfect for startup packaging, gifting brands, and businesses that want coordinated print pieces."
        action={
          <Link to="/bundles" className="primary-link compact">
            Open Bundles <FiArrowRight />
          </Link>
        }
      />

      <div className="bundle-grid">
        {bundles.map((bundle) => (
          <Link key={bundle.id} to={`/product/${bundle.id}`} className="bundle-tile">
            <div className="bundle-image">
              <img
                src={
                  bundle.images?.[0] ||
                  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80'
                }
                alt={bundle.name}
              />
            </div>
            <div className="bundle-copy">
              <span className="bundle-pill">{bundle.bundleGroup || 'Bundle'}</span>
              <h3>{bundle.name}</h3>
              <p>{getDisplayText(bundle.discountText || bundle.shortNote || bundle.description, 'Curated multi-item bundle.')}</p>
              <div className="bundle-footer">
                <strong>{formatCurrency(bundle.price)}</strong>
                <span className="inline-link">
                  Inquiry <FiArrowRight />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ServicesStrip() {
  return (
    <section className="content-section">
      <SectionHeading
        kicker="Why Brands Choose Us"
        title="A more practical print partner."
        text="Less clutter, more clarity: design-minded production, better packaging presentation, and easier inquiry flow."
      />

      <div className="pillar-grid">
        {servicePillars.map((pillar) => (
          <article key={pillar.title} className="pillar-card">
            <div className="pillar-icon">{pillar.icon}</div>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialBand() {
  const items = [
    {
      name: 'Startup Brands',
      quote: 'The packaging finally made our products feel market-ready.',
    },
    {
      name: 'Corporate Clients',
      quote: 'Clean print quality, easy coordination, and dependable timelines.',
    },
    {
      name: 'Event Orders',
      quote: 'Wedding and gifting print looked polished and premium in hand.',
    },
  ];

  return (
    <section className="testimonial-band">
      {items.map((item) => (
        <article key={item.name} className="testimonial-chip">
          <FiStar />
          <div>
            <strong>{item.name}</strong>
            <p>{item.quote}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta-copy">
        <span className="section-kicker">Need A Quote?</span>
        <h2>Tell us what you need and we’ll help shape the right print or packaging setup.</h2>
        <p>Great for bulk packaging, startup bundles, label runs, and custom branded print projects.</p>
      </div>
      <div className="final-cta-actions">
        <a
          href="https://wa.me/923101788571?text=Hello%2C%20I%20want%20a%20quote%20for%20printing%20or%20packaging."
          target="_blank"
          rel="noreferrer"
          className="primary-link"
        >
          <FaWhatsapp /> WhatsApp Inquiry
        </a>
        <Link to="/support" className="secondary-link light">
          Contact Support
        </Link>
      </div>
    </section>
  );
}

// Helper for avatar with gradient background
const getAvatarUrl = (name, email) => {
  const identifier = name || email || 'user';
  // Using ui-avatars with a nice blue gradient
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=3b6797&color=fff&rounded=true&size=56&bold=true&length=2&fontsize=0.28`;
};

// Render stars with half-star support
const renderStars = (rating) => {
  const numericRating = typeof rating === 'number' ? rating : Number(rating) || 0;
  const clampedRating = Math.min(5, Math.max(0, numericRating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  
  return (
    <div className="review-stars" aria-label={`Rating: ${clampedRating} out of 5 stars`}>
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <span key={i} className="star-filled">★</span>;
        }
        if (i === fullStars && hasHalfStar) {
          return <span key={i} className="star-half">★</span>;
        }
        return <span key={i} className="star-empty">★</span>;
      })}
    </div>
  );
};

export default function HomePage({ categories = [], products = [] }) {
  const { categories: liveCategories, products: liveProducts } = useStoreData();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [isHeroSearchFocused, setIsHeroSearchFocused] = useState(false);
  const [heroMotionTick, setHeroMotionTick] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const displayCategories = liveCategories?.length ? liveCategories : categories;
  const displayProducts = liveProducts?.length ? liveProducts : products;
  const displaySlides = useMemo(() => resolveHeroSlides(displayCategories, displayProducts), [displayCategories, displayProducts]);
  const slide = displaySlides[activeSlide] || displaySlides[0];

  const handleSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
        const totalRating = reviewsData.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
        setAverageRating(reviewsData.length > 0 ? totalRating / reviewsData.length : 0);
        setTotalReviews(reviewsData.length);
        setReviewsLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!displaySlides.length || isHeroSearchFocused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % displaySlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [displaySlides.length, isHeroSearchFocused]);

  useEffect(() => {
    if (activeSlide < displaySlides.length) return;
    setActiveSlide(0);
  }, [activeSlide, displaySlides.length]);

  useEffect(() => {
    setHeroMotionTick((current) => current + 1);
  }, [activeSlide]);

  return (
    <div className="home-page">
      <div className="home-shell">
        <Hero
          slide={slide}
          motionTick={heroMotionTick}
          onSearch={handleSearch}
          searchValue={heroSearchQuery}
          onSearchChange={setHeroSearchQuery}
          onSearchFocus={() => setIsHeroSearchFocused(true)}
          onSearchBlur={() => setIsHeroSearchFocused(false)}
        />

        <div className="slide-switcher">
          {displaySlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={index === activeSlide ? 'active' : ''}
              onClick={() => setActiveSlide(index)}
            >
              0{index + 1}
            </button>
          ))}
        </div>

        <TestimonialBand />
        <CategoryShowcase categories={displayCategories} />
        <ProductSpotlight products={displayProducts} />
        <BundleSpotlight products={displayProducts} />
        
        <section className="wedding-promo">
          <div className="wedding-promo-overlay">
            <div className="wedding-promo-content">
              <h2>Wedding Essentials</h2>
              <p>Printing Press brings you all the glams of a glamorous Wedding from gift boxes of different types to wedding cards of your desire. You will be redirected to our sales manager who will fully assist you guiding you through to a magnificent wedding.</p>
              <Link to="/wedding-specials" className="primary-link wedding-cta">
                Explore Wedding Specials <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <ServicesStrip />

        <section className="reviews-hero">
          <div className="hero-copy">
            <span className="hero-kicker">Customer Reviews</span>
            <h1>Real feedback from recent orders</h1>
            <p>★ {averageRating.toFixed(1)} average from {totalReviews} reviews</p>
            
            <div className="hero-highlights">
              <span><FiStar /> Authentic customer voices</span>
              <span><FiStar /> Orders from this month</span>
              <span><FiStar /> Verified experiences</span>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-image-card">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80" 
                alt="Happy customers sharing their printing experience" 
              />
              <div className="hero-badge">
                <FiStar />
                <span>★ {averageRating.toFixed(1)} • {totalReviews} reviews</span>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Review Cards Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h3>What our customers say</h3>
            <p>Join thousands of happy clients who trust us with their printing needs</p>
          </div>
          
          <div className="reviews-scroll-container" id="reviews">
            <div className="reviews-grid">
              {reviewsLoading ? (
                <div className="loading-reviews">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="no-reviews">No reviews yet. Be the first to share your experience!</div>
              ) : (
                reviews.map((review) => {
                  const reviewRating = Number(review.rating) || 0;
                  const reviewerName = review.userName || review.name || 'Anonymous';
                  const reviewComment = review.comment || 'No comment provided.';
                  const productName = review.productName || 'Printing Service';
                  
                  return (
                    <article key={review.id} className="review-card">
                      <div className="review-card-header">
                        <div className="reviewer-info">
                          <div 
                            className="reviewer-avatar"
                            style={{ backgroundImage: `url(${getAvatarUrl(reviewerName, review.email)})` }}
                          />
                          <div className="reviewer-details">
                            <h4>{reviewerName}</h4>
                            <div className="review-rating">
                              {renderStars(reviewRating)}
                              <span className="rating-value">{reviewRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="verified-badge">
                          <FiCheckCircle />
                          <span>Verified</span>
                        </div>
                      </div>
                      
                      <div className="review-card-body">
                        <div className="review-quote">“</div>
                        <p className="review-text">{reviewComment}</p>
                      </div>
                      
                      <div className="review-card-footer">
                        <div className="review-product-tag">
                          <FiThumbsUp size={14} />
                          <span>{productName}</span>
                        </div>
                        <div className="review-date">
                          {(() => {
                            if (!review.timestamp) return 'Recent';
                            if (review.timestamp instanceof Date) return review.timestamp.toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            });
                            if (typeof review.timestamp?.toDate === 'function') {
                              return review.timestamp.toDate().toLocaleDateString('en-US', { 
                                year: 'numeric', month: 'short', day: 'numeric' 
                              });
                            }
                            return new Date(review.timestamp).toLocaleDateString('en-US', { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            });
                          })()}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <FinalCTA />
      </div>

      <style>{`
        .home-page {
          --bg: #eef4fb;
          --paper: #ffffff;
          --ink: #10233f;
          --muted: #60728d;
          --line: #d8e2ef;
          --gold: #3b6797;
          --deep: #0b2343;
          --teal: #335f93;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.14), transparent 28%),
            linear-gradient(180deg, #f7fafe 0%, #ffffff 32%, #eef4fb 100%);
          min-height: 100vh;
          color: var(--ink);
          padding: 18px 16px 56px;
        }

        .home-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .hero-section {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
          align-items: stretch;
          background: linear-gradient(135deg, #f6faff, #ffffff);
          border: 1px solid var(--line);
          border-radius: 32px;
          padding: 30px;
          box-shadow: 0 30px 70px rgba(11, 35, 67, 0.08);
        }

        .hero-copy {
          max-width: none;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-copy-motion {
          will-change: transform, opacity, filter;
        }

        .hero-copy-motion.motion-a {
          animation: heroCopyDriftA 0.85s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .hero-copy-motion.motion-b {
          animation: heroCopyDriftB 0.85s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .hero-kicker,
        .section-kicker {
          display: inline-block;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--gold);
          font-weight: 800;
          margin-bottom: 14px;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(2rem, 3vw, 3.5rem);
          line-height: 1.02;
          letter-spacing: -0.04em;
          color: #1d2939;
          max-width: 11ch;
        }

        .hero-copy p {
          margin: 18px 0 0;
          font-size: 1rem;
          line-height: 1.75;
          color: var(--muted);
          max-width: 52ch;
        }

        .hero-search {
          margin-top: 26px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--line);
          border-radius: 18px;
          background: white;
          padding: 10px 12px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          animation: contentRise 1s ease;
        }

        .hero-search svg {
          color: var(--gold);
          font-size: 1.15rem;
        }

        .hero-search input {
          border: none;
          outline: none;
          background: transparent;
          font: inherit;
          color: var(--ink);
          min-width: 0;
        }

        .hero-search button,
        .primary-link,
        .secondary-link,
        .ghost-link {
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .hero-search button,
        .primary-link {
          background: linear-gradient(135deg, var(--deep), var(--teal));
          color: white;
          font-weight: 800;
          padding: 12px 18px;
          border-radius: 14px;
        }

        .primary-link.compact {
          padding: 11px 16px;
        }

        .secondary-link,
        .ghost-link {
          border: 1px solid var(--line);
          color: var(--ink);
          background: white;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 700;
        }

        .secondary-link.dark {
          background: rgba(20, 33, 61, 0.08);
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
          animation: contentRise 1.1s ease;
        }

        .hero-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
          animation: contentRise 1.2s ease;
        }

        .hero-metrics div {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hero-metrics strong {
          font-size: 1.25rem;
          color: var(--deep);
        }

        .hero-metrics span {
          color: var(--muted);
          font-size: 0.92rem;
        }

        .hero-visual {
          position: relative;
          width: 100%;
          display: flex;
        }

        .hero-visual-stack {
          width: 100%;
          display: grid;
          grid-template-rows: 1fr minmax(120px, 18vh);
          gap: clamp(8px, 2vw, 12px);
          height: clamp(450px, 65vh, 580px);
          align-content: start;
          overflow: hidden;
        }

        .hero-image-wrap {
          position: relative;
          min-height: 0;
          height: 100%;
          width: 100%;
          border-radius: 28px;
          overflow: hidden;
          background: linear-gradient(160deg, var(--accent), #081a31);
          padding: 16px;
          isolation: isolate;
          will-change: transform, filter;
        }

        .hero-image-wrap.motion-a {
          animation: heroImageSweepA 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-image-wrap.motion-b {
          animation: heroImageSweepB 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-image-wrap::after {
          content: '';
          position: absolute;
          inset: 16px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(8, 26, 49, 0.04), rgba(8, 26, 49, 0.3));
          pointer-events: none;
          z-index: 1;
        }

        .hero-image-glow {
          position: absolute;
          inset: 10% auto auto 8%;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.28), transparent 68%);
          mix-blend-mode: screen;
          filter: blur(2px);
          z-index: 1;
          pointer-events: none;
          animation: heroGlowOrbit 7s ease-in-out infinite;
        }

        .hero-image-wrap img {
          width: 100%;
          height: 100%;
          min-height: 0;
          object-fit: cover;
          border-radius: 22px;
          display: block;
          animation: heroZoom 5s ease-in-out forwards;
          position: relative;
          z-index: 0;
        }

        .hero-landscape-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid var(--line);
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.88), rgba(232, 240, 250, 0.96));
          box-shadow: 0 18px 36px rgba(11, 35, 67, 0.08);
        }

        .hero-landscape-wrap.motion-a {
          animation: heroLandscapeRiseA 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-landscape-wrap.motion-b {
          animation: heroLandscapeRiseB 0.95s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-landscape-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
          object-position: center;
        }

        .hero-landscape-wrap:hover img {
          transform: scale(1.05);
        }

        .hero-card {
          position: absolute;
          background: rgba(248, 251, 255, 0.94);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(216, 226, 239, 0.95);
          border-radius: 18px;
          padding: 14px 16px;
          box-shadow: 0 18px 40px rgba(11, 35, 67, 0.12);
          max-width: 220px;
          z-index: 2;
        }

        .hero-card span {
          display: block;
          color: var(--gold);
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .hero-card strong {
          color: var(--deep);
          line-height: 1.4;
        }

        .hero-card-top {
          top: 22px;
          left: 10px;
          animation: cardFloat 4.5s ease-in-out infinite;
        }

        .hero-card-bottom {
          right: 12px;
          bottom: 18px;
          animation: cardFloat 5.2s ease-in-out infinite reverse;
        }

        .slide-switcher {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 18px 0 26px;
        }

        .slide-switcher button {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: white;
          color: #60728d;
          font-weight: 800;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.25s ease, border-color 0.25s ease, color 0.25s ease;
        }

        .slide-switcher button.active {
          background: var(--deep);
          color: white;
          border-color: var(--deep);
        }

        .slide-switcher button:hover {
          transform: translateY(-2px);
        }

        .slide-switcher button.active::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 3px;
          width: 100%;
          background: rgba(255, 255, 255, 0.85);
          transform-origin: left center;
          animation: slideProgress 5s linear;
        }

        .testimonial-band {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 34px;
        }

        .testimonial-chip {
          display: flex;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          animation: fadeUp 0.45s ease;
        }

        @keyframes contentRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroZoom {
          from {
            transform: scale(1.02);
          }
          to {
            transform: scale(1.08);
          }
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes slideProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes heroCopyDriftA {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: translate3d(-26px, 18px, 0) rotate(-1deg) scale(0.98);
          }
          55% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0) scale(1);
          }
        }

        @keyframes heroCopyDriftB {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: translate3d(30px, -14px, 0) rotate(1deg) scale(0.98);
          }
          55% {
            opacity: 1;
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) rotate(0) scale(1);
          }
        }

        @keyframes heroImageSweepA {
          0% {
            opacity: 0;
            filter: saturate(0.8) blur(10px);
            transform: perspective(1400px) rotateY(-10deg) rotateX(4deg) scale(0.96);
          }
          60% {
            opacity: 1;
            filter: saturate(1) blur(0);
          }
          100% {
            opacity: 1;
            transform: perspective(1400px) rotateY(0) rotateX(0) scale(1);
          }
        }

        @keyframes heroImageSweepB {
          0% {
            opacity: 0;
            filter: saturate(0.8) blur(10px);
            transform: perspective(1400px) rotateY(10deg) rotateX(-4deg) scale(0.96);
          }
          60% {
            opacity: 1;
            filter: saturate(1) blur(0);
          }
          100% {
            opacity: 1;
            transform: perspective(1400px) rotateY(0) rotateX(0) scale(1);
          }
        }

        @keyframes heroGlowOrbit {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate3d(28px, 18px, 0) scale(1.12);
            opacity: 1;
          }
        }

        @keyframes heroLandscapeRiseA {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heroLandscapeRiseB {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.96) rotate(-1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0);
          }
        }

        .testimonial-chip svg {
          flex-shrink: 0;
          color: var(--gold);
          font-size: 1.2rem;
          margin-top: 2px;
        }

        .testimonial-chip strong {
          display: block;
          margin-bottom: 5px;
        }

        .testimonial-chip p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .content-section {
          padding: 26px 0;
        }

        .final-cta {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          padding: 28px;
          box-shadow: 0 22px 48px rgba(31, 41, 55, 0.06);
        }

        .bundle-panel {
          background: linear-gradient(135deg, #f4f8fd, #ffffff);
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 22px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(1.8rem, 3vw, 2.7rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 14ch;
          color: var(--deep);
        }

        .section-heading p {
          margin: 10px 0 0;
          color: var(--muted);
          line-height: 1.7;
          max-width: 58ch;
        }

        .category-grid,
        .product-grid,
        .bundle-grid,
        .pillar-grid {
          display: grid;
          gap: 18px;
          perspective: 1400px;
        }

        .category-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .product-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .bundle-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .pillar-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .category-tile,
        .product-tile,
        .bundle-tile,
        .pillar-card {
          text-decoration: none;
          color: inherit;
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          background: white;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
          animation: cardReveal 0.6s ease both;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.05);
        }

        .category-tile:hover,
        .product-tile:hover,
        .bundle-tile:hover,
        .pillar-card:hover,
        .primary-link:hover,
        .secondary-link:hover,
        .ghost-link:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-6deg);
          border-color: #bfd2e5;
          box-shadow: 0 24px 42px rgba(11, 35, 67, 0.14);
        }

        .category-tile::after,
        .product-tile::after,
        .bundle-tile::after,
        .pillar-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.22) 45%, transparent 70%);
          transform: translateX(-130%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }

        .category-tile:hover::after,
        .product-tile:hover::after,
        .bundle-tile:hover::after,
        .pillar-card:hover::after {
          transform: translateX(130%);
        }

        .category-image-shell,
        .product-media,
        .bundle-image {
          height: 210px;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          overflow: hidden;
        }

        .category-image-shell img,
        .product-media img,
        .bundle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .category-tile:hover .category-image-shell img,
        .product-tile:hover .product-media img,
        .bundle-tile:hover .bundle-image img {
          transform: scale(1.04);
        }

        .category-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--gold);
          font-weight: 800;
        }

        .category-tile-copy,
        .product-copy,
        .bundle-copy {
          padding: 16px 16px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 8px;
          position: relative;
          z-index: 1;
          transform: translateZ(16px);
        }

        .category-tile h3,
        .product-copy h3,
        .bundle-copy h3,
        .pillar-card h3 {
          margin: 0;
          color: var(--deep);
          line-height: 1.35;
        }

        .category-tile p,
        .product-copy p,
        .bundle-copy p,
        .pillar-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.92rem;
        }

        .inline-link {
          margin-top: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--gold);
          font-weight: 800;
        }
        .inline-link-explore {
          margin-top: 3px;
          margin-bottom: 12px;
          margin-left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--gold);
          font-weight: 800;
        }

        .product-tag,
        .bundle-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 10px;
          border-radius: 999px;
          background: #ebf2fb;
          color: #335f93;
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }

        .product-footer,
        .bundle-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--line);
        }

        .product-footer strong,
        .bundle-footer strong {
          font-size: 0.95rem;
          color: var(--deep);
        }

        .pillar-card {
          padding: 22px;
          transform: translateZ(0);
        }

        .category-grid > *,
        .product-grid > *,
        .bundle-grid > *,
        .pillar-grid > * {
          animation-delay: calc(var(--stagger, 0) * 0.08s);
        }

        .category-grid > *:nth-child(1),
        .product-grid > *:nth-child(1),
        .bundle-grid > *:nth-child(1),
        .pillar-grid > *:nth-child(1) {
          --stagger: 1;
        }

        .category-grid > *:nth-child(2),
        .product-grid > *:nth-child(2),
        .bundle-grid > *:nth-child(2),
        .pillar-grid > *:nth-child(2) {
          --stagger: 2;
        }

        .category-grid > *:nth-child(3),
        .product-grid > *:nth-child(3),
        .bundle-grid > *:nth-child(3),
        .pillar-grid > *:nth-child(3) {
          --stagger: 3;
        }

        .category-grid > *:nth-child(4),
        .product-grid > *:nth-child(4),
        .bundle-grid > *:nth-child(4),
        .pillar-grid > *:nth-child(4) {
          --stagger: 4;
        }

        .category-grid > *:nth-child(5),
        .product-grid > *:nth-child(5),
        .bundle-grid > *:nth-child(5),
        .pillar-grid > *:nth-child(5) {
          --stagger: 5;
        }

        .category-grid > *:nth-child(6),
        .product-grid > *:nth-child(6),
        .bundle-grid > *:nth-child(6),
        .pillar-grid > *:nth-child(6) {
          --stagger: 6;
        }

        .pillar-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ebf2fb;
          color: var(--gold);
          font-size: 1.35rem;
          margin-bottom: 14px;
          transform: translateZ(24px);
        }

        .final-cta {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          background: linear-gradient(135deg, #14213d, #20345f);
          color: white;
          border: none;
          animation: fadeUp 0.55s ease;
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
            transform: translateY(26px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .final-cta h2 {
          margin: 0;
          max-width: 16ch;
          font-size: clamp(1.9rem, 3vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .final-cta p {
          color: rgba(255, 255, 255, 0.78);
          max-width: 60ch;
          line-height: 1.75;
        }

        .final-cta .section-kicker {
          color: #b7d0ea;
        }

        .final-cta-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .reviews-hero {
         
          padding: 28px;
          margin-bottom: 22px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: center;
        }

        .reviews-hero .hero-kicker {
          color: #fbbf24;
        }

        .reviews-hero h1 {
          font-size: clamp(2.2rem, 4.5vw, 4rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--deep);
          max-width: 12ch;
          margin: 0;
        }

        .reviews-hero p {
          margin: 16px 0 0;
          max-width: 58ch;
          color: var(--muted);
          line-height: 1.8;
          font-size: 1.1rem;
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
          background: #fef3c7;
          border: 1px solid #fcd34d;
          color: #92400e;
          font-weight: 700;
        }

        .hero-highlights svg {
          color: #fbbf24;
          font-size: 1rem;
        }

        .reviews-hero .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .reviews-hero .primary-link {
          background: linear-gradient(135deg, var(--deep), var(--teal));
          color: white;
        }

        .reviews-hero .hero-kicker {
          color: var(--gold);
        }

        .hero-highlights span {
          background: #ebf2fb;
          border-color: var(--line);
          color: var(--deep);
        }

        .hero-highlights svg {
          color: var(--blue);
        }

        .hero-media {
          position: relative;
        }

        .hero-image-card {
          position: relative;
          aspect-ratio: 0.95 / 1;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: 0 20px 42px rgba(251, 191, 36, 0.15);
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
          padding: 12px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--line);
          color: var(--deep);
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.25);
        }

        .hero-badge svg {
          color: #fbbf24;
        }

        /* Modern Review Cards Section */
        .reviews-section {
          margin: 48px 0 32px;
        }

        .reviews-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .reviews-header h3 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--deep);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .reviews-header p {
          color: var(--muted);
          font-size: 1rem;
        }

        .reviews-scroll-container {
          overflow-x: auto;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          padding: 8px 0 16px 0;
        }

        .reviews-scroll-container::-webkit-scrollbar {
          height: 6px;
        }

        .reviews-scroll-container::-webkit-scrollbar-track {
          background: #e2edf7;
          border-radius: 10px;
        }

        .reviews-scroll-container::-webkit-scrollbar-thumb {
          background: #3b6797;
          border-radius: 10px;
        }

        .reviews-grid {
          display: flex;
          gap: 24px;
          padding: 8px 4px 16px 4px;
        }

        /* Review Card Styles */
        .review-card {
          flex: 0 0 360px;
          scroll-snap-align: start;
          background: white;
          border-radius: 24px;
          border: 1px solid #e9eff5;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 35px -10px rgba(59, 103, 151, 0.15);
          border-color: #d4e0ec;
        }

        .review-card-header {
          padding: 20px 20px 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .reviewer-info {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .reviewer-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          background-color: #eef2f8;
          flex-shrink: 0;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .reviewer-details h4 {
          margin: 0 0 6px 0;
          font-size: 1rem;
          font-weight: 700;
          color: #1a2c3e;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .review-stars {
          display: flex;
          gap: 3px;
        }

        .review-stars .star-filled {
          color: #f5b042;
          font-size: 0.85rem;
        }

        .review-stars .star-half {
          color: #f5b042;
          font-size: 0.85rem;
          position: relative;
          display: inline-block;
          overflow: hidden;
          width: 0.7em;
        }

        .review-stars .star-empty {
          color: #dce5ef;
          font-size: 0.85rem;
        }

        .rating-value {
          font-size: 0.7rem;
          font-weight: 600;
          color: #5a6e8a;
          background: #f0f4f9;
          padding: 2px 6px;
          border-radius: 20px;
        }

        .verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #e8f3eb;
          padding: 6px 12px;
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #2c6e3c;
        }

        .verified-badge svg {
          width: 14px;
          height: 14px;
        }

        .review-card-body {
          padding: 16px 20px;
        }

        .review-quote {
          font-size: 2.5rem;
          line-height: 1;
          font-family: Georgia, serif;
          color: rgba(59, 103, 151, 0.2);
          margin-bottom: 8px;
        }

        .review-text {
          margin: 0;
          color: #2c3e5c;
          line-height: 1.55;
          font-size: 0.92rem;
          font-style: normal;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .review-card-footer {
          padding: 12px 20px 20px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f0f4f9;
        }

        .review-product-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f4f9;
          padding: 6px 12px;
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 500;
          color: #3b6797;
        }

        .review-date {
          font-size: 0.7rem;
          color: #8c9aae;
        }

        .loading-reviews, .no-reviews {
          text-align: center;
          padding: 48px;
          background: white;
          border-radius: 28px;
          border: 1px solid var(--line);
          color: var(--muted);
          width: 100%;
        }

        .wedding-promo {
          position: relative;
          height: clamp(420px, 50vh, 520px);
          margin: 40px 0;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 30px 70px rgba(11, 35, 67, 0.15);
        }

        .wedding-promo::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          z-index: 1;
        }

        .wedding-promo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(11, 35, 67, 0.85), rgba(51, 95, 147, 0.9));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          padding: 40px;
          text-align: center;
        }

        .wedding-promo-content {
          max-width: 800px;
          color: white;
        }

        .wedding-promo h2 {
          font-size: clamp(2.2rem, 5vw, 4rem);
          margin: 0 0 24px 0;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .wedding-promo p {
          font-size: 1.15rem;
          line-height: 1.75;
          margin: 0 0 32px 0;
          max-width: 65ch;
        }

        .wedding-cta {
          background: linear-gradient(135deg, var(--teal), var(--gold));
          padding: 16px 28px;
          font-size: 1.05rem;
        }

        @media (max-width: 768px) {
          .wedding-promo-overlay {
            padding: 24px;
          }
          
          .wedding-promo h2 {
            margin-bottom: 18px;
          }
          
          .review-card {
            flex: 0 0 300px;
          }
          
          .review-card-header {
            padding: 16px 16px 0 16px;
          }
          
          .reviewer-avatar {
            width: 44px;
            height: 44px;
          }
          
          .reviewer-details h4 {
            font-size: 0.9rem;
          }
          
          .review-card-body {
            padding: 12px 16px;
          }
          
          .review-quote {
            font-size: 2rem;
          }
          
          .review-text {
            font-size: 0.85rem;
          }
          
          .review-card-footer {
            padding: 10px 16px 16px 16px;
          }
        }

        @media (max-width: 1080px) {
          .reviews-hero {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .reviews-hero {
            padding: 24px;
            border-radius: 24px;
            gap: 20px;
          }
          
          .reviews-header h3 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 1080px) {
          .hero-section,
          .final-cta {
            grid-template-columns: 1fr;
            display: grid;
          }

          .hero-visual-stack {
            grid-template-rows: 1fr minmax(120px, 20vh);
            height: clamp(450px, 65vh, 550px);
            gap: clamp(10px, 2.5vw, 14px);
          }

          .category-grid,
          .product-grid,
          .bundle-grid,
          .pillar-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .testimonial-band {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .home-page {
            padding: 12px 12px 36px;
          }

          .hero-section,
          .alt-panel,
          .bundle-panel,
          .final-cta {
            padding: 20px;
            border-radius: 22px;
          }

          .hero-search {
            grid-template-columns: 1fr;
          }

          .hero-metrics,
          .category-grid,
          .product-grid,
          .bundle-grid,
          .pillar-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            flex-direction: column;
            align-items: start;
          }

          .hero-image-wrap,
          .hero-image-wrap img {
            min-height: 340px;
          }

          .hero-visual-stack {
            grid-template-rows: 1fr minmax(100px, 18vh);
            height: clamp(400px, 60vh, 500px);
            gap: 10px;
          }

          .hero-landscape-wrap {
            height: 100%;
          }

          .hero-card-top,
          .hero-card-bottom {
            position: static;
            margin-top: 12px;
            max-width: none;
          }

          .hero-actions,
          .final-cta-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .product-footer,
          .bundle-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .reviews-grid {
            gap: 16px;
          }
          
          .review-card {
            flex: 0 0 280px;
          }
        }
      `}</style>
    </div>
  );
}