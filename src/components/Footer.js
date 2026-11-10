import { Link } from 'react-router-dom';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <img src="/logo.jpeg" alt="Printing Press logo" className="brand-logo" />
          </div>
          <div>
            <h3 className="brand-name">Printing Press</h3>
            <p className="brand-tag">Quality Printing Services</p>
          </div>
        </div>
        <p>
          Custom packaging, labels, cards, and branded print solutions for growing businesses.
        </p>
      </div>

      <div className="footer-links">
        <div>
          <h4>Browse</h4>
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/bundles">Bundles</Link>
          <Link to="/how-to-order">How to Order</Link>
        </div>

        <div>
          <h4>Services</h4>
          <Link to="/packaging">Packaging</Link>
          <Link to="/labels-tags">Labels & Tags</Link>
          <Link to="/stickers">Stickers</Link>
          <Link to="/corporate-giveaways">Corporate Giveaways</Link>
        </div>

        <div>
          <h4>Support</h4>
          <Link to="/support">Help Center</Link>
          <p>WhatsApp: 0310 1788571</p>
          <p>Response support for custom print orders</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>(c) {currentYear} Printing Press. All rights reserved.</p>
        <div className="social">
          <Link to="/support">Support</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </footer>
  );
}
