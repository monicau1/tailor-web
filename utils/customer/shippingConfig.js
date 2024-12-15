// utils/shippingConfig.js

const SHIPPING_AREAS = {
  // Jakarta (Zona 1)
  "Jakarta Pusat": { zone: 1, cost: 25000 },
  "Jakarta Utara": { zone: 1, cost: 25000 },
  "Jakarta Barat": { zone: 1, cost: 25000 },
  "Jakarta Selatan": { zone: 1, cost: 25000 },
  "Jakarta Timur": { zone: 1, cost: 25000 },

  // Tangerang (Zona 2)
  Tangerang: { zone: 2, cost: 35000 },
  "Tangerang Selatan": { zone: 2, cost: 35000 },
};

const STORE_LOCATION = {
  address: "Jakarta Pusat",
  postalCode: "10120",
};

exports.getShippingCost = (destination) => {
  const area = SHIPPING_AREAS[destination];
  if (!area) return null;
  return area.cost;
};

exports.SHIPPING_AREAS = SHIPPING_AREAS;
exports.STORE_LOCATION = STORE_LOCATION;
