export const formatPrice = (priceInCents: number): string => {
  return (priceInCents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
};
