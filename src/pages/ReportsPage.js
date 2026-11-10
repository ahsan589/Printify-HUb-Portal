export default function ReportsPage({ products, categories }) {
  const topProducts = products.slice(0, 3);

  return (
    <div className="page content">
      <div className="section-head">
        <h2>Reports & Analytics</h2>
        <p>Track the activity and inventory across your store.</p>
      </div>
      <div className="stats">
        <div className="stat-card">
          <p>Top-selling products</p>
          <h3>{topProducts.length}</h3>
          <span>Based on recent orders</span>
        </div>
        <div className="stat-card">
          <p>Category count</p>
          <h3>{categories.length}</h3>
          <span>Active categories</span>
        </div>
        <div className="stat-card">
          <p>Active users</p>
          <h3>1,240</h3>
          <span>Last 30 days</span>
        </div>
      </div>
      <div className="report-list">
        {topProducts.map((product) => (
          <div key={product.id} className="report-row">
            <div>
              <h4>{product.name}</h4>
              <p>{product.sku}</p>
            </div>
            <span>${product.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
