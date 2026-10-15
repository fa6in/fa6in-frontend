export const LOCAL_PHONE = /^[234]\d{7}$/;
export const LOCAL_PHONE_EXAMPLE = "32421036";
export const LOCAL_PHONE_HINT = "8 أرقام تبدأ بـ 2 أو 3 أو 4، مثل 32421036";

export function normalizeLocalPhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 8);
}

export function isLocalPhone(value: string) {
  return LOCAL_PHONE.test(value);
}
