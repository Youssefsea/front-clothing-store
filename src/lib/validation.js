// Input validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, can be more restrictive based on requirements
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(phone?.replace(/\D/g, ""));
};

export const validateForm = (form, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = form[field];

    if (rule.required && !value) {
      errors[field] = `${rule.label || field} is required`;
    } else if (rule.type === "email" && value && !validateEmail(value)) {
      errors[field] = "Invalid email address";
    } else if (rule.type === "password" && value && !validatePassword(value)) {
      errors[field] = `${rule.label || field} must be at least 6 characters`;
    } else if (rule.type === "phone" && value && !validatePhone(value)) {
      errors[field] = "Invalid phone number";
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${rule.label || field} must be at most ${rule.maxLength} characters`;
    }
  });

  return errors;
};

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};
