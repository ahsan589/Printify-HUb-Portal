import CategoryShowcasePage from '../components/CategoryShowcasePage';
import { isStandardProduct } from '../utils/productHelpers';

export default function OfficeStationeryPage({ products, categories }) {
  const officeCategory = categories.find((cat) => cat.name.toLowerCase().includes('office'));
  const officeProducts = products.filter(
    (product) => product.categoryId === officeCategory?.id && isStandardProduct(product)
  );

  return (
    <CategoryShowcasePage
      title="Office Stationery"
      subtitle="Professional office essentials for daily operations, branding, and business use."
      heroImage={
        officeCategory?.image ||
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80'
      }
      products={officeProducts}
      emptyTitle="No Office Stationery Products Found"
      emptyText="Check back soon for our office stationery collection."
    />
  );
}
