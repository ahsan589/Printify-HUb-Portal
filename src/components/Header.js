import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { isAdminUser } from '../utils/auth';

const BRAND_NAME = 'Printing Press';
const BRAND_TAGLINE = 'Quality Printing Services';

const Header = ({ onOpenMenu, user }) => {
  const isAdmin = isAdminUser(user);

  const location = useLocation();

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Signs out the current user.
 * @throws {Error} If there's an error signing out.
 */
/*******  e46aeef0-72c7-4a69-a7ca-878b32e242be  *******/  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <img src="/logo.jpeg" alt="Printing Press logo" className="brand-logo" />
        </div>
        <div>
          <h1 className="brand-name">{BRAND_NAME}</h1>
          <p className="brand-tag">{BRAND_TAGLINE}</p>
        </div>
      </div>
      <nav className="nav">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/categories" className={location.pathname === '/categories' ? 'active' : ''}>Categories</Link>
        <Link to="/bundles" className={location.pathname === '/bundles' ? 'active' : ''}>Bundles</Link>
        <Link to="/wedding-specials" className={location.pathname === '/wedding-specials' ? 'active' : ''}>Wedding Specials</Link>
        <Link to="/clothing-packaging" className={location.pathname === '/clothing-packaging' ? 'active' : ''}>Clothing Packaging</Link>
        <Link to="/office-stationery" className={location.pathname === '/office-stationery' ? 'active' : ''}>Office Stationery</Link>
        <Link to="/corporate-giveaways" className={location.pathname === '/corporate-giveaways' ? 'active' : ''}>Corporate Giveaways</Link>
        <Link to="/stickers" className={location.pathname === '/stickers' ? 'active' : ''}>Stickers</Link>
        <Link to="/labels-tags" className={location.pathname === '/labels-tags' ? 'active' : ''}>Labels & Tags</Link>
        <Link to="/packaging" className={location.pathname === '/packaging' ? 'active' : ''}>Packaging</Link>

        <Link to="/support" className={location.pathname === '/support' ? 'active' : ''}>Support</Link>
        <Link to="/how-to-order" className={location.pathname === '/how-to-order' ? 'active' : ''}>How to Order</Link>
        {user ? (
          <>
            {isAdmin && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>}
            <button className="ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
            <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link>
          </>
        )}
      </nav>
      <div className="header-actions">
        <button className="menu-toggle" onClick={onOpenMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

// Styles moved to Header.css

export default Header;
