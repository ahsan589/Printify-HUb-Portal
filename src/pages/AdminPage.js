import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBox, FiGrid, FiLock } from 'react-icons/fi';
import useAuthUser from '../hooks/useAuthUser';
import { isAdminUser } from '../utils/auth';

const adminCards = [
  {
    icon: <FiBox />,
    title: 'Products',
    text: 'Add products, edit pricing, upload images, and update bundle items.',
    to: '/products-management',
    cta: 'Manage Products',
  },
  {
    icon: <FiGrid />,
    title: 'Categories',
    text: 'Create categories, update images, and keep storefront sections organized.',
    to: '/categories-management',
    cta: 'Manage Categories',
  },
];

export default function AdminPage() {
  const user = useAuthUser();
  const isAdmin = isAdminUser(user);

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <div className="denied-card">
          <div className="denied-icon">
            <FiLock />
          </div>
          <h2>Access denied</h2>
          <p>You must be an administrator to open the dashboard.</p>
          <Link to="/" className="back-btn">
            Return Home
          </Link>
        </div>

        <style jsx="true">{`
          .admin-denied {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background:
              radial-gradient(circle at top left, rgba(59, 103, 151, 0.12), transparent 24%),
              linear-gradient(180deg, #f7fafe 0%, #eef4fb 100%);
          }

          .denied-card {
            width: min(440px, 100%);
            border-radius: 28px;
            padding: 32px;
            border: 1px solid #d8e2ef;
            background: white;
            box-shadow: 0 22px 48px rgba(11, 35, 67, 0.08);
            text-align: center;
          }

          .denied-icon {
            width: 68px;
            height: 68px;
            margin: 0 auto 18px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0b2343, #335f93);
            color: white;
            font-size: 1.6rem;
          }

          .denied-card h2 {
            margin: 0;
            color: #0b2343;
            font-size: clamp(2rem, 5vw, 2.8rem);
            line-height: 1.05;
            letter-spacing: -0.03em;
          }

          .denied-card p {
            margin: 14px 0 0;
            color: #60728d;
            line-height: 1.75;
          }

          .back-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: 22px;
            padding: 13px 18px;
            border-radius: 16px;
            text-decoration: none;
            font-weight: 800;
            color: white;
            background: linear-gradient(135deg, #0b2343, #335f93);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <section className="admin-hero">
          <span className="hero-kicker">Admin Dashboard</span>
          <h1>Simple catalog management.</h1>
          <p>
            Choose what you want to manage, open the relevant page, and update the storefront
            content without extra dashboard clutter.
          </p>
          <div className="admin-user">Signed in as {user.email}</div>
        </section>

        <section className="admin-content">
          <div className="section-head">
            <div>
              <span className="section-kicker">Management</span>
              <h2>Choose a section</h2>
            </div>
            <p>Open products or categories and update the storefront directly.</p>
          </div>

          <div className="admin-grid">
            {adminCards.map((card) => (
              <article key={card.title} className="admin-card">
                <div className="card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link to={card.to} className="card-link">
                  {card.cta} <FiArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .admin-page {
          --ink: #10233f;
          --muted: #60728d;
          --line: #d8e2ef;
          --navy: #0b2343;
          --blue: #335f93;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 103, 151, 0.12), transparent 24%),
            linear-gradient(180deg, #f7fafe 0%, #eef4fb 100%);
          padding: 18px 16px 56px;
          color: var(--ink);
        }

        .admin-shell {
          max-width: 1100px;
          margin: 0 auto;
        }

        .admin-hero,
        .admin-content {
          border: 1px solid var(--line);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 22px 48px rgba(11, 35, 67, 0.07);
        }

        .admin-hero {
          padding: 30px;
          margin-bottom: 22px;
          animation: fadeUp 0.55s ease;
        }

        .hero-kicker,
        .section-kicker {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--blue);
        }

        .admin-hero h1 {
          margin: 0;
          font-size: clamp(2.2rem, 4vw, 3.6rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: var(--navy);
        }

        .admin-hero p {
          margin: 16px 0 0;
          max-width: 62ch;
          color: var(--muted);
          line-height: 1.8;
        }

        .admin-user {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          padding: 12px 14px;
          border-radius: 16px;
          background: #f7fafe;
          border: 1px solid var(--line);
          color: var(--navy);
          font-weight: 700;
        }

        .admin-content {
          padding: 24px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: end;
          margin-bottom: 22px;
        }

        .section-head h2 {
          margin: 0;
          color: var(--navy);
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .section-head p {
          margin: 0;
          color: var(--muted);
          line-height: 1.75;
          max-width: 44ch;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .admin-card {
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 24px;
          background: white;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.06);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: fadeUp 0.45s ease;
        }

        .admin-card:hover {
          transform: translateY(-3px);
          border-color: #bfd2e5;
          box-shadow: 0 18px 34px rgba(11, 35, 67, 0.1);
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ebf2fb;
          color: var(--blue);
          font-size: 1.35rem;
          margin-bottom: 16px;
        }

        .admin-card h3 {
          margin: 0;
          color: var(--navy);
        }

        .admin-card p {
          margin: 10px 0 0;
          color: var(--muted);
          line-height: 1.75;
          min-height: 5.2em;
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          text-decoration: none;
          font-weight: 800;
          color: var(--blue);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 720px) {
          .admin-page {
            padding: 12px 12px 36px;
          }

          .admin-hero,
          .admin-content {
            padding: 20px;
            border-radius: 22px;
          }

          .section-head,
          .admin-grid {
            grid-template-columns: 1fr;
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-grid {
            display: grid;
          }
        }
      `}</style>
    </div>
  );
}
