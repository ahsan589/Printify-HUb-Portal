import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function PackagingPage({ products, categories }) {
  const packagingCategory = categories.find((cat) => cat.name.toLowerCase().includes('packaging'));
  const packagingProducts = products.filter(
    (product) => product.categoryId === packagingCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Packaging"
      subtitle="Smart packaging solutions for retail, shipping, gifting, and branded presentation."
      heroImage={
        packagingCategory?.image ||
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80'
      }
      products={packagingProducts}
      emptyTitle="No Packaging Products Found"
      emptyText="Check back soon for our packaging collection."
    />
  );
}
