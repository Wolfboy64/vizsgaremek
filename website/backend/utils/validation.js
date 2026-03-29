export const NAME_REGEX = /^\p{L}[\p{L}\s.'-]{1,98}$/u;
export const FULL_NAME_REGEX = /^\p{L}[\p{L}.'-]{1,48}\s+\p{L}[\p{L}\s.'-]{1,48}$/u;
export const USERNAME_REGEX = /^[\p{L}\d._ -]{3,30}$/u;
export const BILLING_NAME_REGEX = /^[\p{L}\d][\p{L}\d\s.'\-()/,&]{1,118}$/u;
export const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;
export const PHONE_REGEX = /^\+?[0-9\s()-]{8,20}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{6,64}$/;

export const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

export const isValidPositiveInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

export const isValidDateValue = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};
