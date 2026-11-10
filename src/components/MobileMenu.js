import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import useAuthUser from '../hooks/useAuthUser';
import { isAdminUser } from '../utils/auth';

export default function MobileMenu({ open, onClose, categories }) {
  const user = useAuthUser();
  const isAdmin = isAdminUser(user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose(); // Close the mobile menu after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <>
      <div className={open ? 'mobile-menu-overlay open' : 'mobile-menu-overlay'} onClick={onClose} />
      <aside className={open ? 'mobile-menu open' : 'mobile-menu'} aria-hidden={!open}>
        <div className="mobile-menu-head">
          <div>
            <p className="mobile-menu-title">Menu</p>
            <p className="mobile-menu-sub">Navigate categories quickly</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu">
            X
          </button>
        </div>

        <nav className="mobile-links">
          <Link to="/" onClick={onClose}>Home</Link>
          <Link to="/categories" onClick={onClose}>Categories</Link>
          <Link to="/how-to-order" onClick={onClose}>How to Order</Link>
          <Link to="/support" onClick={onClose}>Support</Link>
          {isAdmin && (
            <>
              <Link to="/products-management" onClick={onClose}>Manage Products</Link>
              <Link to="/categories-management" onClick={onClose}>Manage Categories</Link>
              <Link to="/reports" onClick={onClose}>Reports</Link>
            </>
          )}
          {user ? (
            <button className="ghost" onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>Login</Link>
              <Link to="/register" onClick={onClose}>Register</Link>
            </>
          )}
        </nav>
        <div className="mobile-category-list">
          {categories.map((item) => (
            <Link key={`menu-${item.id}`} className="mobile-category" to={`/categories/${item.id}`} onClick={onClose}>
              {item.name}
              <span>{'>'}</span>
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
