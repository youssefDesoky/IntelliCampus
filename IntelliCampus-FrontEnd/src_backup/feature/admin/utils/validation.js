const EGYPT_NATIONALITY = "Egypt";

export function validateNationalId(value) {
  if (!value) return "National ID is required";
  if (!/^\d{14}$/.test(value)) return "Must be exactly 14 digits";
  if (!/^[23]/.test(value)) return "Must start with 2 or 3";
  return "";
}

export function validatePassport(value) {
  if (!value) return "Passport number is required";
  if (!/^[A-Z]\d{5,8}$/.test(value)) return "Must start with an uppercase letter followed by 6-9 digits";
  return "";
}

export function validateNationalIdOrPassport(value, nationality) {
  if (!nationality) return "Nationality is required";
  if (nationality === EGYPT_NATIONALITY) return validateNationalId(value);
  return validatePassport(value);
}

export function validatePhoneNumber(value) {
  if (!value) return "Phone number is required";
  if (!/^\d{11}$/.test(value)) return "Must be exactly 11 digits";
  if (!/^(010|011|012|015)/.test(value)) return "Must start with 010, 011, 012, or 015";
  return "";
}

export { EGYPT_NATIONALITY };

export const EXCLUDED_COUNTRIES = ["IL"];

