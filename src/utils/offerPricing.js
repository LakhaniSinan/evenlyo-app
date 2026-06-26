export const getOfferItemTitle = (item, currentLanguage = 'en') => {
  if (currentLanguage === 'nl') {
    return item?.title?.nl || item?.title?.en || item?.title || '';
  }
  return item?.title?.en || item?.title?.nl || item?.title || '';
};

export const getOfferItemImage = item =>
  item?.images?.[0] || item?.image || item?.featuredImage || null;

export const getOfferItemKey = (item, index = 0) =>
  String(item?.uniqueId || item?.id || item?._id || index);

export const getOfferItemPricing = item => {
  const breakdown = item?.pricingBreakdown || {};
  const securityFee = Number(item?.securityFee || 0);
  const offerSubtotal = Number(
    item?.discountedPrice ?? breakdown?.subtotal ?? 0,
  );
  const listingBasePrice = Number(
    breakdown?.baseAmount ?? breakdown?.basePrice ?? item?.basePrice ?? 0,
  );
  const platformFee = Number(breakdown?.platformFee || 0);
  const vatFee = Number(breakdown?.vatFee || 0);
  const fullCalculatedTotal = Number(
    (offerSubtotal + securityFee + platformFee + vatFee).toFixed(2),
  );
  const payableTotal = Number((offerSubtotal + securityFee).toFixed(2));

  return {
    offerSubtotal,
    listingBasePrice,
    securityFee,
    platformFee,
    vatFee,
    fullCalculatedTotal,
    payableTotal,
  };
};

export const getOfferPricingSummary = offerObject => {
  const rawItems = offerObject?.items || [];
  const items = rawItems.map((item, index) => ({
    item,
    index,
    key: getOfferItemKey(item, index),
    ...getOfferItemPricing(item),
  }));

  const totals = items.reduce(
    (acc, row) => ({
      listingBasePrice: acc.listingBasePrice + row.listingBasePrice,
      offerSubtotal: acc.offerSubtotal + row.offerSubtotal,
      securityFee: acc.securityFee + row.securityFee,
      platformFee: acc.platformFee + row.platformFee,
      vatFee: acc.vatFee + row.vatFee,
    }),
    {
      listingBasePrice: 0,
      offerSubtotal: 0,
      securityFee: 0,
      platformFee: 0,
      vatFee: 0,
    },
  );

  const fullCalculatedTotal = Number(
    (
      totals.offerSubtotal +
      totals.securityFee +
      totals.platformFee +
      totals.vatFee
    ).toFixed(2),
  );
  const payableTotal = Number(
    (totals.offerSubtotal + totals.securityFee).toFixed(2),
  );

  return {
    ...totals,
    items,
    itemCount: items.length,
    fullCalculatedTotal,
    payableTotal,
  };
};
