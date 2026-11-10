import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function LabelsTagsPage({ products, categories }) {
  const labelsCategory = categories.find((cat) => cat.name.toLowerCase().includes('label'));
  const labelsProducts = products.filter(
    (product) => product.categoryId === labelsCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Labels & Tags"
      subtitle="Clean branded labels, tags, and packaging identifiers for every product line."
      heroImage={
        labelsCategory?.image ||
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1600&q=80'
      }
      products={labelsProducts}
      emptyTitle="No Products Found"
      emptyText="Check back soon for our labels and tags collection."
    />
  );
}
