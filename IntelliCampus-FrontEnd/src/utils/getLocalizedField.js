export function getLocalizedField(obj, fieldName, language) {
  if (!obj) return '';
  const arField = `${fieldName}Ar`;
  return language === 'ar' && obj[arField] != null ? obj[arField] : obj[fieldName];
}
