import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function CorporateGiveawaysPage({ products, categories }) {
  const corporateCategory = categories.find((cat) => cat.name.toLowerCase().includes('corporate'));
  const corporateProducts = products.filter(
    (product) => product.categoryId === corporateCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Promotional Items"
      subtitle="Branded giveaways and promotional products for campaigns, teams, and events."
      heroImage={
        corporateCategory?.image ||
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80'
      }
      products={corporateProducts}
      emptyTitle="No Products Found"
      emptyText="Check back soon for our promotional items collection."
    />
  );
}
