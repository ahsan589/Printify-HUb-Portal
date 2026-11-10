import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function StickersPage({ products, categories }) {
  const stickersCategory = categories.find((cat) => cat.name.toLowerCase().includes('sticker'));
  const stickerProducts = products.filter(
    (product) => product.categoryId === stickersCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Stickers"
      subtitle="Custom sticker printing for packaging, branding, events, and product labeling."
      heroImage={
        stickersCategory?.image ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80'
      }
      products={stickerProducts}
      emptyTitle="No Stickers Found"
      emptyText="Check back soon for our sticker collection."
    />
  );
}
