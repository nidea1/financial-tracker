export const formatCurrency = (
  value: number,
  options?: { locale?: string; currency?: string }
) => {
  const locale = options?.locale ?? "tr-TR";
  const currency = options?.currency ?? "TRY";

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });

  if (Number.isNaN(value)) {
    return formatter.format(0);
  }

  return formatter.format(value);
};
