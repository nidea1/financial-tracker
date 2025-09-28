type Translator = (key: string, values?: Record<string, string | number>) => string;

export const getNameError = (value: string, t: Translator) => {
  if (value === "") {
    return null;
  }

  if (!value.trim()) {
    return t("dashboard.validation.nameRequired");
  }

  return null;
};

export const getAmountError = (value: string, t: Translator) => {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return t("dashboard.validation.amountPositive");
  }

  return null;
};

export const getCountError = (value: string, t: Translator) => {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    return t("dashboard.validation.countPositive");
  }

  return null;
};

export const isMoneyFormValid = (name: string, amount: string) => {
  const trimmedName = name.trim();
  const parsedAmount = Number(amount);
  return trimmedName.length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0;
};
