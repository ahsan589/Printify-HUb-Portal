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

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    padding: '0 6%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '80px',
    transition: 'all 0.3s ease',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  brandMark: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },

  brandName: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },

  brandTag: {
    margin: '2px 0 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500',
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },

  navLinkHover: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
    color: '#1e40af',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },

  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s ease',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
  },

  menuToggle: {
    display: 'none',
    flexDirection: 'column',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background 0.2s ease',
  },

  menuBar: {
    width: '24px',
    height: '3px',
    background: '#475569',
    margin: '3px 0',
    borderRadius: '2px',
    transition: 'all 0.2s ease',
  },

  // Media queries for responsiveness
  '@media (max-width: 1024px)': {
    nav: {
      gap: '15px',
    },
    navLink: {
      padding: '6px 12px',
      fontSize: '0.9rem',
    },
  },

  '@media (max-width: 768px)': {
    header: {
      padding: '0 4%',
      height: '70px',
    },
    brand: {
      gap: '10px',
    },
    brandMark: {
      width: '45px',
      height: '45px',
      fontSize: '1.3rem',
    },
    brandName: {
      fontSize: '1.3rem',
    },
    brandTag: {
      fontSize: '0.8rem',
    },
    nav: {
      display: 'none', // Hide nav on mobile, show mobile menu
    },
    menuToggle: {
      display: 'flex',
    },
  },

  '@media (max-width: 480px)': {
    header: {
      padding: '0 3%',
      height: '65px',
    },
    brandMark: {
      width: '40px',
      height: '40px',
      fontSize: '1.2rem',
    },
    brandName: {
      fontSize: '1.2rem',
    },
    brandTag: {
      fontSize: '0.75rem',
    },
  },
};

export default Header;
