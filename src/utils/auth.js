export const isAdminEmail = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();

  return normalizedEmail === 'admin@example.com' || normalizedEmail.includes('admin');
};

export const isAdminUser = (user) => isAdminEmail(user?.email || '');

export const requiresEmailVerification = (user) => Boolean(user?.email) && !isAdminUser(user);
