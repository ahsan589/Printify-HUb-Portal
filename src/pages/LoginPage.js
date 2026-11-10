import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { isAdminUser, requiresEmailVerification } from '../utils/auth';

const createEmptyState = () => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const AUTH_COPY = {
  login: {
    eyebrow: 'Customer Access',
    title: 'Welcome back to your print desk.',
    description: 'Track orders, review saved details, and continue your next print request without starting over.',
    submit: 'Sign In',
    switchLabel: "Don't have an account?",
    switchAction: 'Create one',
    switchTo: '/register',
    accent: 'Secure login',
  },
  register: {
    eyebrow: 'Create Account',
    title: 'Set up your print account in a minute.',
    description: 'Register once to manage quotes, check order updates, and keep your print details ready for the next job.',
    submit: 'Create Account',
    switchLabel: 'Already have an account?',
    switchAction: 'Sign in',
    switchTo: '/login',
    accent: 'Fast registration',
  },
};

export default function LoginPage({ user, mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [formState, setFormState] = useState(createEmptyState);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(location.state?.email || '');
  const [busy, setBusy] = useState(false);
  const copy = AUTH_COPY[mode] || AUTH_COPY.login;
  const isRegister = mode === 'register';
  const isAdmin = isAdminUser(user);
  const needsVerification = user && requiresEmailVerification(user) && !user.emailVerified;

  const statItems = useMemo(
    () => [
      { label: 'Quick quotes', value: '24h' },
      { label: 'Popular products', value: '40+' },
      { label: 'Return customers', value: 'Top tier' },
    ],
    []
  );

  const updateField = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    const credential = await signInWithEmailAndPassword(auth, formState.email, formState.password);

    if (requiresEmailVerification(credential.user) && !credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setPendingVerificationEmail(credential.user.email || formState.email);
      setInfo('Your email is not verified yet. We sent a fresh verification link.');
      return;
    }

    navigate(isAdminUser(credential.user) ? '/admin' : redirectTo, { replace: true });
  };

  const handleRegister = async () => {
    if (formState.password !== formState.confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const credential = await createUserWithEmailAndPassword(auth, formState.email, formState.password);

    if (formState.name.trim()) {
      await updateProfile(credential.user, {
        displayName: formState.name.trim(),
      });
    }

    if (requiresEmailVerification(credential.user)) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
      navigate('/login', {
        replace: true,
        state: {
          email: credential.user.email || formState.email,
          message: 'Account created. Please verify your email before signing in.',
        },
      });
      return;
    }

    navigate('/admin', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);

    try {
      if (isRegister) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      const fallbackMessage = isRegister
        ? 'We could not create your account right now.'
        : 'Login failed. Check your email and password.';
      setError(err?.message || fallbackMessage);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    setInfo('');
    await signOut(auth);
  };

  const handleResendVerification = async () => {
    if (!user) return;

    setError('');
    setInfo('');
    setBusy(true);

    try {
      await sendEmailVerification(user);
      setInfo(`Verification email sent to ${user.email}.`);
    } catch (err) {
      setError(err?.message || 'Unable to resend verification email.');
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!user) return;

    setError('');
    setInfo('');
    setBusy(true);

    try {
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        setInfo('Email verified successfully. Your account is ready.');
        navigate('/', { replace: true });
      } else {
        setInfo('Verification is still pending. Check your inbox and spam folder, then try again.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to refresh verification status.');
    } finally {
      setBusy(false);
    }
  };

  if (user && needsVerification) {
    return (
      <div className="auth-shell">
        <div className="auth-layout verified">
          <section className="auth-panel spotlight">
            <p className="auth-eyebrow">Verify Email</p>
            <h1>One last step before we continue.</h1>
            <p className="auth-copy">
              We need to verify <strong>{user.email}</strong> before opening customer access. Admin accounts skip this requirement.
            </p>
            {info ? <p className="auth-message success">{info}</p> : null}
            {error ? <p className="auth-message error">{error}</p> : null}
            <div className="auth-actions">
              <button className="primary-btn" type="button" onClick={handleRefreshVerification} disabled={busy}>
                {busy ? 'Checking...' : 'I Verified My Email'}
              </button>
              <button className="secondary-btn" type="button" onClick={handleResendVerification} disabled={busy}>
                Resend Email
              </button>
            </div>
            <button className="text-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </section>
        </div>

        <AuthStyles />
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-shell">
        <div className="auth-layout verified">
          <section className="auth-panel spotlight">
            <p className="auth-eyebrow">{isAdmin ? 'Admin Access' : 'Signed In'}</p>
            <h1>{isAdmin ? 'Dashboard access is ready.' : 'You are already signed in.'}</h1>
            <p className="auth-copy">
              Logged in as <strong>{user.email}</strong>
            </p>
            <div className="auth-actions">
              <Link className="primary-btn link-btn" to={isAdmin ? '/admin' : '/'}>
                {isAdmin ? 'Open Admin Dashboard' : 'Go to Homepage'}
              </Link>
              <button className="secondary-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </section>
        </div>

        <AuthStyles />
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-panel spotlight">
          <p className="auth-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="auth-copy">{copy.description}</p>

          <div className="stat-grid">
            {statItems.map((item) => (
              <div key={item.label} className="stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="spotlight-note">
            <span>{copy.accent}</span>
            <p>Customer accounts require email verification. Admin can still sign in directly.</p>
          </div>
        </section>

        <section className="auth-panel form-panel">
          <div className="form-top">
            <div>
              <p className="form-kicker">{isRegister ? 'New account' : 'Member sign in'}</p>
              <h2>{isRegister ? 'Register' : 'Login'}</h2>
            </div>
            <Link to={copy.switchTo} className="mini-switch">
              {copy.switchAction}
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegister ? (
              <label className="field">
                <span>Full Name</span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formState.name}
                  onChange={(event) => updateField('name', event.target.value)}
                />
              </label>
            ) : null}

            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                placeholder="name@example.com"
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder={isRegister ? 'Create a secure password' : 'Enter your password'}
                value={formState.password}
                onChange={(event) => updateField('password', event.target.value)}
                required
              />
            </label>

            {isRegister ? (
              <label className="field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={formState.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                  required
                />
              </label>
            ) : null}

            {info ? <p className="auth-message success">{info}</p> : null}
            {error ? <p className="auth-message error">{error}</p> : null}
            {pendingVerificationEmail && !isRegister ? (
              <p className="helper-text">
                Verification pending for <strong>{pendingVerificationEmail}</strong>. Open your inbox, confirm your email, then sign in again.
              </p>
            ) : null}

            <button className="primary-btn submit-btn" type="submit" disabled={busy}>
              {busy ? 'Please wait...' : copy.submit}
            </button>
          </form>

          <p className="switch-copy">
            {copy.switchLabel} <Link to={copy.switchTo}>{copy.switchAction}</Link>
          </p>
        </section>
      </div>

      <AuthStyles />
    </div>
  );
}

function AuthStyles() {
  return (
    <style jsx="true">{`
      .auth-shell {
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, rgba(59, 103, 151, 0.14), transparent 28%),
          linear-gradient(180deg, #f7fafe 0%, #ffffff 32%, #eef4fb 100%);
        padding: 32px 16px 48px;
        color: var(--ink);
      }

      .auth-layout {
        width: min(1100px, 100%);
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
        gap: 24px;
        align-items: stretch;
      }

      .auth-layout.verified {
        max-width: 640px;
        grid-template-columns: 1fr;
      }

      .auth-panel {
        border-radius: 30px;
        border: 1px solid rgba(18, 38, 63, 0.08);
        box-shadow: 0 24px 70px rgba(18, 38, 63, 0.1);
      }

      .spotlight {
        background:
          linear-gradient(160deg, var(--accent), var(--accent-dark)),
          linear-gradient(160deg, #335f93, #0b2343);
        color: #f4f8fd;
        padding: 36px;
        position: relative;
        overflow: hidden;
      }

      .spotlight::after {
        content: '';
        position: absolute;
        inset: auto -40px -60px auto;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: rgba(191, 210, 229, 0.22);
        filter: blur(0px);
      }

      .auth-eyebrow,
      .form-kicker {
        margin: 0 0 12px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .auth-eyebrow {
        color: #b7d0ea;
      }

      .spotlight h1,
      .form-panel h2 {
        margin: 0;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .spotlight h1 {
        font-size: clamp(2.5rem, 5vw, 4.5rem);
        max-width: 10ch;
      }

      .auth-copy {
        margin: 18px 0 0;
        max-width: 52ch;
        color: rgba(244, 248, 253, 0.84);
        line-height: 1.8;
      }

      .stat-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 28px;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 18px;
        backdrop-filter: blur(8px);
      }

      .stat-card strong {
        display: block;
        font-size: 1.4rem;
        color: #fff;
      }

      .stat-card span {
        display: block;
        margin-top: 6px;
        color: rgba(244, 248, 253, 0.74);
        font-size: 0.92rem;
      }

      .spotlight-note {
        margin-top: 26px;
        padding: 18px 20px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .spotlight-note span {
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(235, 242, 251, 0.16);
        color: #dbe7f4;
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .spotlight-note p {
        margin: 12px 0 0;
        color: rgba(244, 248, 253, 0.84);
        line-height: 1.7;
      }

      .form-panel {
        background: rgba(255, 255, 255, 0.92);
        padding: 32px;
        backdrop-filter: blur(12px);
      }

      .form-top {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: start;
        margin-bottom: 26px;
      }

      .form-kicker {
        color: var(--accent);
      }

      .form-panel h2 {
        font-size: clamp(2rem, 4vw, 3rem);
        color: var(--ink);
      }

      .mini-switch {
        color: var(--accent);
        font-weight: 700;
        text-decoration: none;
      }

      .auth-form {
        display: grid;
        gap: 16px;
      }

      .field {
        display: grid;
        gap: 8px;
      }

      .field span {
        font-size: 0.92rem;
        font-weight: 700;
        color: #334155;
      }

      .field input {
        width: 100%;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid #d8e2ef;
        background: #f7fafe;
        color: var(--ink);
        font: inherit;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      }

      .field input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px rgba(51, 95, 147, 0.12);
        transform: translateY(-1px);
      }

      .auth-message,
      .helper-text {
        margin: 0;
        border-radius: 16px;
        padding: 12px 14px;
        line-height: 1.6;
      }

      .auth-message.success {
        background: #ebf2fb;
        color: var(--accent);
        border: 1px solid #bfd2e5;
      }

      .auth-message.error {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .helper-text {
        background: #f7fafe;
        color: var(--muted);
        border: 1px solid #d8e2ef;
      }

      .primary-btn,
      .secondary-btn,
      .text-btn,
      .link-btn {
        font: inherit;
        border-radius: 16px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      }

      .primary-btn:hover,
      .secondary-btn:hover,
      .text-btn:hover,
      .link-btn:hover {
        transform: translateY(-1px);
      }

      .primary-btn:disabled,
      .secondary-btn:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .primary-btn,
      .link-btn {
        border: none;
        background: linear-gradient(135deg, var(--accent-dark), var(--accent));
        color: white;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .submit-btn {
        min-height: 54px;
        margin-top: 4px;
      }

      .secondary-btn {
        border: 1px solid #d8e2ef;
        background: white;
        color: var(--ink);
        padding: 14px 18px;
      }

      .text-btn {
        border: none;
        background: transparent;
        color: #f4f8fd;
        padding: 0;
        margin-top: 18px;
      }

      .auth-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 24px;
      }

      .switch-copy {
        margin: 22px 0 0;
        color: var(--muted);
        line-height: 1.7;
      }

      .switch-copy a {
        color: var(--accent);
        font-weight: 700;
        text-decoration: none;
      }

      @media (max-width: 900px) {
        .auth-layout {
          grid-template-columns: 1fr;
        }

        .spotlight h1 {
          max-width: none;
        }
      }

      @media (max-width: 640px) {
        .auth-shell {
          padding: 18px 12px 32px;
        }

        .spotlight,
        .form-panel {
          padding: 24px 20px;
          border-radius: 24px;
        }

        .stat-grid {
          grid-template-columns: 1fr;
        }

        .form-top,
        .auth-actions {
          flex-direction: column;
        }
      }
    `}</style>
  );
}
