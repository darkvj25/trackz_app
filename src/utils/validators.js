// Utility input validators

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  const re = /^(09|\+639)\d{9}$/;
  return re.test(String(phone).replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};
