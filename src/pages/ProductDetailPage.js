// src/pages/ProductDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import {
  findPricingMatrixMatch,
  formatCurrency,
  formatPriceDisplay,
  groupCustomizationOptions,
  isBundleProduct,
} from '../utils/productHelpers';
import { db } from '../firebase'; // adjust to your actual firebase export
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const buildWhatsAppMessage = (product) => {
  const customizationText = product.__customizationMessage
    ? `Customization Request: ${product.__customizationMessage}\n`
    : '';

  if (isBundleProduct(product)) {
    const items = (product.bundleItems || [])
      .map((item) => `- ${item.title}${item.details ? ` (${item.details})` : ''}`)
      .join('\n');

    return encodeURIComponent(
      `Hello! I'm interested in this bundle:\n\n` +
        `Bundle Name: ${product.name}\n` +
        `SKU: ${product.sku || 'N/A'}\n` +
        `Bundle Price: ${formatPriceDisplay(product.price)}\n` +
        customizationText +
        (items ? `Included Items:\n${items}\n` : '') +
        `\nPlease share complete bundle details and availability.`
    );
  }

  return encodeURIComponent(
    `Hello! I'm interested in this product:\n\n` +
      `Product Name: ${product.name}\n` +
      `SKU: ${product.sku || 'N/A'}\n` +
      `Price: ${formatPriceDisplay(product.price)}\n` +
      `Description: ${product.description || ''}\n` +
      customizationText +
      `\nPlease provide me with complete details, pricing, and availability.`
  );
};

export default function ProductDetailPage({ products }) {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customizationDetails] = useState('');
  const [selectedCustomizationFile] = useState('');
  const [selectedCustomizationOptions, setSelectedCustomizationOptions] = useState({});
  const [imageOffset, setImageOffset] = useState({ x: 50, y: 50 });
  const [imageHovered, setImageHovered] = useState(false);
  const [bundlePreview, setBundlePreview] = useState(null);

  // Review states
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const product = products.find((item) => item.id === id);
  const bundleMode = isBundleProduct(product);

  // Base price – keep original product price for top display
  const basePrice = useMemo(() => {
    if (typeof product?.price === 'number') return product.price;
    if (typeof product?.price === 'string') return product.price; // range string
    return 0;
  }, [product]);

  const basePriceDisplay = useMemo(() => {
    if (typeof basePrice === 'string') return basePrice;
    return formatCurrency(basePrice);
  }, [basePrice]);

  // Build all customization groups (including those not used for pricing)
  const allCustomizationGroups = useMemo(() => {
    if (product?.customizationGroups?.length) {
      return product.customizationGroups.map((group) => ({
        label: group.name,
        options: (group.options || []).map((option) => ({
          label: option,
          price: 0,
          raw: option,
          groupLabel: group.name,
        })),
        useInPricing: group.useInPricing ?? true,
      }));
    }
    // Fallback to legacy customizationOptions
    return groupCustomizationOptions(
      product?.customizationOptions || [],
      product?.customizationTitle || 'Customization'
    ).map((group) => ({ ...group, useInPricing: true }));
  }, [product]);

  // Groups that are used for pricing (matrix rows)
  const pricingGroups = useMemo(
    () => allCustomizationGroups.filter((g) => g.useInPricing === true),
    [allCustomizationGroups]
  );

  // Selections for pricing groups only
  const pricingSelections = useMemo(() => {
    const selections = {};
    pricingGroups.forEach((group) => {
      const value = selectedCustomizationOptions[group.label];
      if (value) selections[group.label] = value;
    });
    return selections;
  }, [selectedCustomizationOptions, pricingGroups]);

  const allPricingSelected = useMemo(
    () => pricingGroups.length > 0 && pricingGroups.every((g) => Boolean(selectedCustomizationOptions[g.label])),
    [selectedCustomizationOptions, pricingGroups]
  );

  const hasPricingMatrix = Array.isArray(product?.pricingMatrix) && product.pricingMatrix.length > 0;
  const matchedPricingRow = findPricingMatrixMatch(
    product?.pricingMatrix || [],
    pricingSelections,
    pricingGroups
  );
  const matrixPrice = matchedPricingRow ? Number(matchedPricingRow.price) : 0;

  // Add‑on price from non‑pricing groups (e.g., colour surcharge)
  const selectedAddOnItems = allCustomizationGroups
    .filter((g) => !g.useInPricing)
    .flatMap((g) => g.options.filter((opt) => opt.raw === selectedCustomizationOptions[g.label]))
    .filter(Boolean);
  const addOnPrice = selectedAddOnItems.reduce((total, opt) => total + Number(opt.price || 0), 0);

  // Final unit price: if matrix row selected, use that; otherwise base + addOns
  const finalUnitPrice = hasPricingMatrix && matchedPricingRow ? matrixPrice : Number(basePrice) + addOnPrice;
  const totalPrice = finalUnitPrice * quantity;

  // Fetch average rating from Firestore
  useEffect(() => {
    if (!product?.id) return;
    const fetchRating = async () => {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('productId', '==', product.id));
        const snapshot = await getDocs(q);
        const reviewsList = snapshot.docs.map(doc => doc.data());
        const total = reviewsList.length;
        if (total === 0) {
          setAverageRating(0);
          setTotalReviews(0);
          return;
        }
        const sum = reviewsList.reduce((acc, rev) => acc + rev.rating, 0);
        const avg = sum / total;
        setAverageRating(avg);
        setTotalReviews(total);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };
    fetchRating();
  }, [product?.id]);

  const handleQuoteRequest = () => {
    if (!product) return;
    const phoneNumber = '923101788571';
    const customizationMessage = [
      ...allCustomizationGroups
        .flatMap((group) => {
          const selected = group.options.find((opt) => opt.raw === selectedCustomizationOptions[group.label]);
          if (selected) {
            return `${group.label}: ${selected.label}${selected.price ? ` (+${formatCurrency(selected.price)})` : ''}`;
          }
          return [];
        }),
      customizationDetails?.trim(),
      selectedCustomizationFile ? `Attachment reference: ${selectedCustomizationFile}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
    const message = buildWhatsAppMessage({
      ...product,
      price: finalUnitPrice,
      __customizationMessage: customizationMessage,
    });
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      alert('Please enter your name and review comment.');
      return;
    }
    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5.');
      return;
    }
    setReviewSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        productName: product.name,
        userName: reviewerName.trim(),
        rating: Number(rating),
        comment: reviewComment.trim(),
        timestamp: new Date().toISOString(),
      });
      // Refresh average rating
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('productId', '==', product.id));
      const snapshot = await getDocs(q);
      const reviewsList = snapshot.docs.map(doc => doc.data());
      const sum = reviewsList.reduce((acc, rev) => acc + rev.rating, 0);
      setAverageRating(sum / reviewsList.length);
      setTotalReviews(reviewsList.length);
      setReviewSubmitSuccess(true);
      setReviewerName('');
      setRating(5);
      setReviewComment('');
      setTimeout(() => setReviewSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleImageMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;
    setImageOffset({
      x: Math.min(100, Math.max(0, 100 - relativeX * 100)),
      y: Math.min(100, Math.max(0, 100 - relativeY * 100)),
    });
  };

  const resetImageMotion = () => {
    setImageHovered(false);
    setImageOffset({ x: 50, y: 50 });
  };

  const renderStars = (ratingValue) => {
    const fullStars = Math.floor(ratingValue);
    const halfStar = ratingValue % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <span className="stars">
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="star filled">★</span>)}
        {halfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="star empty">★</span>)}
      </span>
    );
  };

  if (!product) {
    return (
      <div className="page content">
        <h2>Product not found</h2>
        <p>Try another product or category.</p>
      </div>
    );
  }

  const customizationEnabled =
    product?.customizationEnabled || allCustomizationGroups.length > 0 || product?.customizationNote;

  return (
    <div className={`product-page ${bundleMode ? 'bundle-page' : ''}`}>
      <div className={`product-detail-container ${bundleMode ? 'bundle-detail-container' : ''}`}>
        {/* Gallery Section */}
        <div className="product-gallery-section">
          <div
            className="main-image-container"
            onMouseMove={handleImageMove}
            onMouseEnter={() => setImageHovered(true)}
            onMouseLeave={resetImageMotion}
          >
            {product.images?.[selectedImage] ? (
              <div className="product-image-stage">
                <img
                  key={product.images[selectedImage]}
                  className={`product-image ${bundleMode ? 'cover' : 'contain'}`}
                  src={product.images[selectedImage]}
                  alt={`${product.name} preview ${selectedImage + 1}`}
                  style={{
                    transform: imageHovered ? 'scale(1.9)' : 'scale(1)',
                    transformOrigin: `${imageOffset.x}% ${imageOffset.y}%`,
                  }}
                />
                <div className="image-sheen" />
              </div>
            ) : (
              <div className="placeholder-image">No Image Available</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className={`thumbnail-grid ${bundleMode ? 'bundle-thumbnails' : ''}`}>
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail-btn ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div
                    className="thumbnail-image"
                    style={{
                      backgroundImage: `url(${img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            {bundleMode ? (
              <div className="bundle-price-block">
                {product.compareAtPrice ? (
                  <span className="compare-price">{formatCurrency(product.compareAtPrice)}</span>
                ) : null}
                <span className="bundle-price">{basePriceDisplay}</span>
              </div>
            ) : (
              <div className="product-price-section">
                <span className="price">{basePriceDisplay}</span>
              </div>
            )}
          </div>

          {/* Rating display (only average rating, no review list) */}
          <div className="product-rating">
            {averageRating > 0 ? (
              <>
                {renderStars(averageRating)}
                <span className="rating-value">{averageRating.toFixed(1)}</span>
                <span className="rating-count">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
              </>
            ) : (
              <span className="no-rating">No ratings yet</span>
            )}
          </div>

          {!bundleMode && product.sku ? (
            <div className="product-meta">
              <div className="sku-badge">
                <span className="meta-label">SKU:</span>
                <span className="meta-value">{product.sku}</span>
              </div>
            </div>
          ) : null}

          {product.discountText ? <p className="bundle-highlight">{product.discountText}</p> : null}
          {product.shortNote ? <p className="bundle-note">{product.shortNote}</p> : null}
          {product.description ? <p className="product-description">{product.description}</p> : null}

          {customizationEnabled ? (
            <div className="customization-panel">
              <h3 className="section-title">{product.customizationTitle || 'Customization Options'}</h3>
              {product.customizationNote ? <p className="customization-note">{product.customizationNote}</p> : null}

              {allCustomizationGroups.length ? (
                <>
                  <div className="customization-grid">
                    {allCustomizationGroups.map((group) => (
                      <label key={group.label} className="customization-field">
                        <span>{group.label}</span>
                        <select
                          className="customization-select"
                          value={selectedCustomizationOptions[group.label] || ''}
                          onChange={(event) =>
                            setSelectedCustomizationOptions((current) => ({
                              ...current,
                              [group.label]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose an option</option>
                          {group.options.map((option) => (
                            <option key={`${group.label}-${option.raw}`} value={option.raw}>
                              {option.label}{option.price ? ` (+${formatCurrency(option.price)})` : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>

                  {hasPricingMatrix && allPricingSelected && !matchedPricingRow ? (
                    <p className="customization-price-note warning">
                      No price row matched this combination yet. Please update the pricing matrix in admin.
                    </p>
                  ) : null}

                  {(hasPricingMatrix && matchedPricingRow) || addOnPrice > 0 ? (
                    <div className="price-summary">
                      {hasPricingMatrix && matchedPricingRow && (
                        <p className="customization-price-note">
                          Selected combination total: <strong>{formatCurrency(matrixPrice)}</strong>
                        </p>
                      )}
                      {addOnPrice > 0 && (
                        <p className="customization-price-note">
                          Add‑ons total: <strong>{formatCurrency(addOnPrice)}</strong>
                        </p>
                      )}
                      <p className="final-total">
                        Final unit price: <strong>{formatCurrency(finalUnitPrice)}</strong>
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          {bundleMode && product.materials?.length ? (
            <div className="materials-section">
              <h3 className="section-title">Materials</h3>
              <ul className="materials-list">
                {product.materials.map((material, index) => (
                  <li key={`${material}-${index}`}>{material}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {bundleMode && product.bundleItems?.length ? (
            <div className="bundle-items-section">
              {product.bundleItems.map((item, index) => (
                <div key={`${item.title}-${index}`} className="bundle-item-row">
                  <div className="bundle-item-thumb">
                    {item.image ? (
                      <button
                        type="button"
                        className="bundle-item-preview-btn"
                        onClick={() =>
                          setBundlePreview({
                            src: item.image,
                            title: item.title,
                          })
                        }
                      >
                        <img src={item.image} alt={item.title} />
                      </button>
                    ) : (
                      <div className="bundle-item-placeholder" />
                    )}
                  </div>
                  <div className="bundle-item-copy">
                    <strong>{item.title}</strong>
                    {item.details ? <span>{item.details}</span> : null}
                  </div>
                  <div className="bundle-item-prices">
                    {item.originalPrice ? (
                      <span className="bundle-item-old">{formatCurrency(item.originalPrice)}</span>
                    ) : null}
                    <span className="bundle-item-new">{formatCurrency(item.price || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!bundleMode && product.specs && product.specs.length > 0 && (
            <div className="specs-section">
              <h3 className="section-title">Specifications</h3>
              <div className="specs-grid">
                {product.specs.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-dot">•</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review submission form */}
          <div className="review-form-section">
            <h3 className="section-title">Write a Review</h3>
            {reviewSubmitSuccess && <div className="review-success">Thank you! Your review has been submitted.</div>}
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={4}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button type="submit" className="submit-review-btn" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {bundleMode ? (
            <>
              <div className="bundle-totals">
                <div>
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(finalUnitPrice * quantity)}</strong>
                </div>
                <div>
                  <span>Add-ons total:</span>
                  <strong>{formatCurrency(0)}</strong>
                </div>
                <div className="total-row">
                  <span>Total:</span>
                  <strong>{formatCurrency(totalPrice)}</strong>
                </div>
              </div>

              <div className="bundle-actions">
                <div className="quantity-box">
                  <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((current) => current + 1)}>+</button>
                </div>
                <button className="primary-action-btn bundle-cta" onClick={handleQuoteRequest}>
                  Inquiry
                </button>
              </div>

              {product.uploadNote ? (
                <div className="upload-panel">
                  <p>{product.uploadNote}</p>
                  <label className="upload-dropzone">
                    <input type="file" />
                    <span>Click to choose the file or drag it here</span>
                  </label>
                </div>
              ) : null}
            </>
          ) : (
            <div className="action-buttons">
              <div className="quantity-box">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => current + 1)}>+</button>
              </div>
              <div className="total-amount">Total: {formatCurrency(totalPrice)}</div>
              <button className="primary-action-btn" onClick={handleQuoteRequest}>
                Request Quote on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {bundlePreview ? (
        <div className="bundle-preview-backdrop" onClick={() => setBundlePreview(null)}>
          <div
            className="bundle-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={bundlePreview.title || 'Bundle item preview'}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="bundle-preview-close"
              onClick={() => setBundlePreview(null)}
            >
              ×
            </button>
            <div className="bundle-preview-image-wrap">
              <img src={bundlePreview.src} alt={bundlePreview.title || 'Bundle item preview'} />
            </div>
            {bundlePreview.title ? <p>{bundlePreview.title}</p> : null}
          </div>
        </div>
      ) : null}

      <style>{`
        .product-page {
          background: #fff;
          padding: 24px 16px 48px;
        }

        .product-detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          max-width: 1320px;
          margin: 0 auto;
          padding: 28px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          animation: fadeUp 0.55s ease;
        }

        .bundle-detail-container {
          grid-template-columns: minmax(360px, 520px) 1fr;
          align-items: start;
        }

        .product-gallery-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .main-image-container {
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
          border: 1px solid #d8e2ef;
          box-shadow: 0 20px 45px rgba(11, 35, 67, 0.08);
        }

        .product-image-stage,
        .placeholder-image {
          width: 100%;
          height: 100%;
        }

        .product-image-stage {
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at top left, rgba(59, 103, 151, 0.1), transparent 28%);
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          animation: imageReveal 0.55s ease;
          transition: transform 0.16s ease-out, transform-origin 0.16s ease-out, filter 0.16s ease-out;
          filter: saturate(1) contrast(1.02);
          will-change: transform;
        }

        .product-image.cover {
          object-fit: cover;
        }

        .product-image.contain {
          object-fit: contain;
          padding: 22px;
        }

        .main-image-container:hover .product-image {
          filter: saturate(1.05) contrast(1.05);
        }

        .image-sheen {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.22) 35%, transparent 60%);
          transform: translateX(-130%);
          pointer-events: none;
        }

        .main-image-container:hover .image-sheen {
          animation: sheenPass 1s ease;
        }

        .placeholder-image {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .bundle-thumbnails {
          grid-template-columns: repeat(3, minmax(0, 96px));
        }

        .thumbnail-btn {
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          overflow: hidden;
          background: white;
          padding: 0;
          cursor: pointer;
          aspect-ratio: 1 / 1;
          transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
        }

        .thumbnail-btn.active {
          border-color: #335f93;
          box-shadow: 0 0 0 3px rgba(51, 95, 147, 0.18);
        }

        .thumbnail-btn:hover {
          transform: translateY(-2px);
          border-color: #bfd2e5;
        }

        .thumbnail-image {
          width: 100%;
          height: 100%;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .product-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-title {
          font-size: 2.1rem;
          line-height: 1.2;
          margin: 0;
          color: #0b2343;
        }

        .product-price-section,
        .bundle-price-block {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .price,
        .bundle-price {
          font-size: 1.9rem;
          font-weight: 800;
          color: #0b2343;
        }

        .compare-price {
          font-size: 1.15rem;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .product-meta {
          display: flex;
        }

        .sku-badge {
          background: #f8fafc;
          padding: 10px 16px;
          border-radius: 999px;
        }

        .meta-label {
          color: #64748b;
          margin-right: 6px;
        }

        .meta-value {
          color: #1f2937;
          font-weight: 700;
        }

        .bundle-highlight,
        .bundle-note,
        .product-description {
          margin: 0;
          color: #475569;
          line-height: 1.7;
        }

        .materials-section,
        .specs-section,
        .customization-panel,
        .upload-panel {
          border-top: 1px dashed #d6dde5;
          padding-top: 16px;
        }

        .customization-note {
          margin: 0 0 12px;
          color: #475569;
          line-height: 1.7;
        }

        .customization-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .customization-grid {
          display: grid;
          gap: 12px;
          margin-bottom: 12px;
        }

        .customization-field span {
          font-size: 0.92rem;
          font-weight: 700;
          color: #334155;
        }

        .customization-select {
          width: 100%;
          border: 1px solid #dbe3ea;
          border-radius: 12px;
          padding: 12px 14px;
          font: inherit;
          color: #334155;
          background: #fff;
        }

        .customization-price-note {
          margin: 0 0 12px;
          color: #335f93;
          line-height: 1.6;
        }

        .customization-price-note.warning {
          color: #b45309;
        }

        .price-summary {
          margin-top: 10px;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .final-total {
          margin-top: 6px;
          font-size: 1rem;
          font-weight: 600;
          color: #0b2343;
        }

        .customization-textarea {
          width: 100%;
          border: 1px solid #dbe3ea;
          border-radius: 12px;
          padding: 12px 14px;
          resize: vertical;
          font: inherit;
          color: #334155;
          background: #fff;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 1rem;
          margin: 0 0 10px;
          color: #111827;
        }

        .materials-list {
          margin: 0;
          padding-left: 18px;
          color: #475569;
          line-height: 1.9;
        }

        .bundle-items-section {
          border-top: 1px dashed #d6dde5;
          padding-top: 12px;
        }

        .bundle-item-row {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px dotted #d6dde5;
          animation: fadeUp 0.4s ease;
        }

        .bundle-item-thumb {
          width: 42px;
          height: 42px;
          border-radius: 6px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }

        .bundle-item-preview-btn {
          width: 100%;
          height: 100%;
          padding: 0;
          border: none;
          background: transparent;
          cursor: zoom-in;
        }

        .bundle-item-thumb img,
        .bundle-item-placeholder {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bundle-item-copy {
          display: flex;
          flex-direction: column;
          gap: 3px;
          color: #475569;
          font-size: 0.95rem;
        }

        .bundle-item-prices {
          display: flex;
          gap: 10px;
          align-items: center;
          white-space: nowrap;
        }

        .bundle-item-old {
          color: #9ca3af;
          text-decoration: line-through;
          font-size: 0.85rem;
        }

        .bundle-item-new {
          font-weight: 800;
          color: #111827;
        }

        .bundle-preview-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(11, 35, 67, 0.68);
          backdrop-filter: blur(8px);
        }

        .bundle-preview-modal {
          position: relative;
          width: min(680px, 100%);
          padding: 20px;
          border-radius: 24px;
          border: 1px solid #d8e2ef;
          background: #ffffff;
          box-shadow: 0 28px 70px rgba(11, 35, 67, 0.22);
        }

        .bundle-preview-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 999px;
          background: #0b2343;
          color: #ffffff;
          font: inherit;
          cursor: pointer;
        }

        .bundle-preview-image-wrap {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #d8e2ef;
          background: linear-gradient(135deg, #edf4fc, #ffffff);
        }

        .bundle-preview-image-wrap img {
          width: 100%;
          max-height: 72vh;
          object-fit: contain;
          display: block;
        }

        .bundle-preview-modal p {
          margin: 14px 0 0;
          color: #0b2343;
          font-weight: 700;
        }

        .bundle-totals {
          margin-left: auto;
          width: min(260px, 100%);
          display: grid;
          gap: 10px;
        }

        .bundle-totals div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #334155;
        }

        .bundle-totals .total-row {
          font-size: 1.1rem;
          padding-top: 10px;
          border-top: 1px solid #d6dde5;
        }

        .bundle-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .quantity-box {
          display: inline-flex;
          align-items: center;
          border: 1px solid #335f93;
          border-radius: 999px;
          overflow: hidden;
          height: 40px;
        }

        .quantity-box button,
        .quantity-box span {
          min-width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: white;
        }

        .quantity-box button {
          cursor: pointer;
          color: #335f93;
          font-weight: 700;
        }

        .primary-action-btn {
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #0b2343, #335f93);
          color: white;
          font-weight: 800;
          cursor: pointer;
          padding: 14px 24px;
        }

        .bundle-cta {
          text-transform: uppercase;
        }

        .upload-panel p {
          margin: 0 0 12px;
          color: #334155;
          font-weight: 500;
        }

        .upload-dropzone {
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          min-height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94a3b8;
          cursor: pointer;
          padding: 16px;
        }

        .upload-dropzone input {
          display: none;
        }

        .specs-grid {
          display: grid;
          gap: 10px;
        }

        .spec-item {
          display: flex;
          gap: 10px;
          color: #475569;
        }

        .spec-dot {
          color: #335f93;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
        }

        .total-amount {
          font-weight: bold;
          font-size: 1.2rem;
          color: #0b2343;
        }

        /* Rating and review styles */
        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 10px 0;
        }
        .stars {
          display: inline-flex;
          gap: 2px;
        }
        .star {
          font-size: 1.3rem;
          color: #d1d5db;
        }
        .star.filled, .star.half {
          color: #fbbf24;
        }
        .star.half {
          position: relative;
          display: inline-block;
          overflow: hidden;
          width: 0.9em;
        }
        .rating-value {
          font-weight: 600;
          color: #0b2343;
        }
        .rating-count {
          font-size: 0.85rem;
          color: #64748b;
        }
        .no-rating {
          color: #9ca3af;
          font-style: italic;
        }
        .review-form-section {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .review-success {
          background: #d1fae5;
          color: #065f46;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #334155;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          font-family: inherit;
        }
        .star-input {
          display: flex;
          gap: 6px;
        }
        .star-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
          color: #d1d5db;
          transition: color 0.1s;
        }
        .star-btn.active {
          color: #fbbf24;
        }
        .submit-review-btn {
          background: linear-gradient(135deg, #0b2343, #335f93);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
        }
        .submit-review-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        @keyframes imageReveal {
          from {
            opacity: 0;
            transform: scale(1.04);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sheenPass {
          from {
            transform: translateX(-130%);
          }
          to {
            transform: translateX(130%);
          }
        }

        @media (max-width: 960px) {
          .product-detail-container,
          .bundle-detail-container {
            grid-template-columns: 1fr;
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .product-page {
            padding: 12px 12px 36px;
          }

          .product-title {
            font-size: 1.7rem;
          }

          .thumbnail-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .bundle-item-row {
            grid-template-columns: 42px 1fr;
          }

          .bundle-item-prices {
            grid-column: 2;
            justify-content: flex-start;
          }

          .product-image.contain {
            padding: 14px;
          }

          .product-rating {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}