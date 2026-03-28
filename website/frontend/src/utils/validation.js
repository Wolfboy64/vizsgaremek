export const NAME_REGEX = /^\p{L}[\p{L}\s.'-]{1,98}$/u;
export const FULL_NAME_REGEX =
  /^\p{L}[\p{L}.'-]{1,48}\s+\p{L}[\p{L}\s.'-]{1,48}$/u;
export const USERNAME_REGEX = /^[A-Za-z0-9._-]{3,30}$/;
export const BILLING_NAME_REGEX = /^[\p{L}\d][\p{L}\d\s.'\-()/,&]{1,118}$/u;
export const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;
export const PHONE_REGEX = /^\+?[0-9\s()-]{8,20}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,64}$/;

export const isValidName = (value) =>
  NAME_REGEX.test(String(value || "").trim());
export const isValidFullName = (value) =>
  FULL_NAME_REGEX.test(String(value || "").trim());
export const isValidUsername = (value) =>
  USERNAME_REGEX.test(String(value || "").trim());
export const isValidBillingName = (value) =>
  BILLING_NAME_REGEX.test(String(value || "").trim());
export const isValidEmail = (value) =>
  EMAIL_REGEX.test(String(value || "").trim());
export const isValidPhone = (value) =>
  PHONE_REGEX.test(String(value || "").trim());
export const isValidPassword = (value) =>
  PASSWORD_REGEX.test(String(value || ""));
