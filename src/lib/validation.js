// Input validation utilities matching backend rules.
export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

export const validatePassword = (password) =>
  typeof password === "string" && password.length >= 6 && password.length <= 50;

export const validateName = (name) =>
  typeof name === "string" && name.trim().length >= 3 && name.trim().length <= 100;

export const validatePhone = (phone) =>
  /^[0-9]{10,15}$/.test((phone || "").replace(/\D/g, ""));

export const validateOtp = (otp) => /^[0-9]{6}$/.test(otp || "");

export const validateSignup = (form) => {
  const errors = {};
  if (!validateName(form.name)) {
    errors.name = "Name must be between 3 and 100 characters.";
  }
  if (!validateEmail(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!validatePassword(form.password)) {
    errors.password = "Password must be between 6 and 50 characters.";
  }
  if (!validatePhone(form.phone)) {
    errors.phone = "Phone must be 10–15 digits.";
  }
  return errors;
};