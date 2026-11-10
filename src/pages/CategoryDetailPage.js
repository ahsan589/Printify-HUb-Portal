import { useParams } from 'react-router-dom';
import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function CategoryDetailPage({ categories, products }) {
  const { id } = useParams();
  const category = categories.find((item) => item.id === id);
  const items = products.filter((product) => product.categoryId === id && isStandardProduct(product));

  return (
    <CategoryShowcasePage
      title={category?.name || 'Category'}
      subtitle={category?.description || 'Explore products in this category.'}
      heroImage={
        category?.image ||
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80'
      }
      products={items}
      emptyTitle="No Products Found"
      emptyText="Check back soon or add products to this category from admin."
    />
  );
}
