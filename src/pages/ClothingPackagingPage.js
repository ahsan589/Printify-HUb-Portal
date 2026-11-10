import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function ClothingPackagingPage({ products, categories }) {
  const clothingCategory = categories.find((cat) => cat.name.toLowerCase().includes('clothing'));
  const clothingProducts = products.filter(
    (product) => product.categoryId === clothingCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Clothing Packaging"
      subtitle="Premium bags, tags, sleeves, and boxes for fashion and apparel brands."
      heroImage={
        clothingCategory?.image ||
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80'
      }
      products={clothingProducts}
      emptyTitle="No Products Found"
      emptyText="Check back soon for our clothing packaging collection."
    />
  );
}
