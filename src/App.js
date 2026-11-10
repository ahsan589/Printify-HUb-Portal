import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { services } from './data/mockData';
import useStoreData from './hooks/useStoreData';
import useAuthUser from './hooks/useAuthUser';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import BundlesPage from './pages/BundlesPage';
import WeddingSpecialsPage from './pages/WeddingSpecialsPage';
import ClothingPackagingPage from './pages/ClothingPackagingPage';
import OfficeStationeryPage from './pages/OfficeStationeryPage';
import CorporateGiveawaysPage from './pages/CorporateGiveawaysPage';
import StickersPage from './pages/StickersPage';
import LabelsTagsPage from './pages/LabelsTagsPage';
import PackagingPage from './pages/PackagingPage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupportPage from './pages/SupportPage';
import HowToOrderPage from './pages/HowToOrderPage';
import AdminPage from './pages/AdminPage';
import ReportsPage from './pages/ReportsPage';
import ProductsManagementPage from './pages/ProductsManagementPage';
import CategoriesManagementPage from './pages/CategoriesManagementPage';
import './App.css';

function RequireAuth({ user, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowDialog(true);
    }
  }, [user]);

  if (!user) {
    return showDialog ? (
      <div className="auth-dialog-backdrop">
        <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
          <p className="auth-dialog-eyebrow">Login Required</p>
          <h2 id="auth-dialog-title">Login to access this page</h2>
          <p>
            Please sign in first. After login, you can continue to the product page you selected.
          </p>
          <div className="auth-dialog-actions">
            <button
              className="auth-dialog-btn"
              type="button"
              onClick={() => {
                setShowDialog(false);
                navigate('/login', { replace: true, state: { from: location.pathname } });
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    ) : null;
  }

  return children;
}

function App() {
  const { categories, products } = useStoreData();
  const user = useAuthUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="app">
      <Header onOpenMenu={() => setMenuOpen(true)} user={user} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} />
      <Routes>
        <Route path="/" element={<HomePage categories={categories} products={products} services={services} />} />
        <Route path="/categories" element={<CategoriesPage categories={categories} />} />
        <Route path="/categories/:id" element={<CategoryDetailPage categories={categories} products={products} />} />
        <Route path="/bundles" element={<BundlesPage products={products} categories={categories} />} />
        <Route path="/wedding-specials" element={<WeddingSpecialsPage products={products} categories={categories} />} />
        <Route path="/clothing-packaging" element={<ClothingPackagingPage products={products} categories={categories} />} />
        <Route path="/office-stationery" element={<OfficeStationeryPage products={products} categories={categories} />} />
        <Route path="/corporate-giveaways" element={<CorporateGiveawaysPage products={products} categories={categories} />} />
        <Route path="/stickers" element={<StickersPage products={products} categories={categories} />} />
        <Route path="/labels-tags" element={<LabelsTagsPage products={products} categories={categories} />} />
        <Route path="/packaging" element={<PackagingPage products={products} categories={categories} />} />
        <Route
          path="/product/:id"
          element={(
            <RequireAuth user={user}>
              <ProductDetailPage products={products} />
            </RequireAuth>
          )}
        />
        <Route path="/search" element={<SearchPage products={products} categories={categories} />} />
        <Route path="/login" element={<LoginPage user={user} />} />
        <Route path="/register" element={<RegisterPage user={user} />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/how-to-order" element={<HowToOrderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/products-management" element={<ProductsManagementPage />} />
        <Route path="/categories-management" element={<CategoriesManagementPage />} />
        <Route path="/reports" element={<ReportsPage products={products} categories={categories} />} />
      </Routes>
      <Footer />

      <style jsx="true">{`
        .auth-dialog-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(11, 35, 67, 0.46);
          backdrop-filter: blur(8px);
        }

        .auth-dialog {
          width: min(440px, 100%);
          padding: 28px;
          border-radius: 28px;
          border: 1px solid #d8e2ef;
          background: linear-gradient(180deg, #ffffff, #f7fafe);
          box-shadow: 0 28px 80px rgba(11, 35, 67, 0.18);
          color: #10233f;
        }

        .auth-dialog .auth-dialog-eyebrow {
          margin: 0 0 10px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #335f93;
        }

        .auth-dialog h2 {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #0b2343;
        }

        .auth-dialog p {
          margin: 14px 0 0;
          line-height: 1.7;
          color: #60728d;
        }

        .auth-dialog-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 22px;
        }

        .auth-dialog-btn {
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          background: linear-gradient(135deg, #0b2343, #335f93);
          color: #ffffff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default App;
