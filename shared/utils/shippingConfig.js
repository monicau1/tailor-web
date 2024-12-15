// shared/utils/shippingConfig.js

exports.SHIPPING_AREAS = {
  JAKARTA_BARAT: {
    name: "Jakarta Barat",
    cost: 20000,
    zone: 1,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
  },
  JAKARTA_UTARA: {
    name: "Jakarta Utara",
    cost: 25000,
    zone: 2,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
  },
  JAKARTA_PUSAT: {
    name: "Jakarta Pusat",
    cost: 30000,
    zone: 2,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
  },
  KOTA_TANGERANG: {
    name: "Kota Tangerang",
    cost: 25000,
    zone: 2,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
  },
  TANGERANG_SELATAN: {
    name: "Tangerang Selatan",
    cost: 30000,
    zone: 2,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
  },
};

// Konstanta untuk metode pengiriman
exports.DELIVERY_METHODS = {
  SELF_DROPOFF: "self_dropoff", // Antar sendiri ke toko
  COURIER: "courier", // Dijemput kurir
};

// Konstanta untuk metode pengambilan
exports.RETURN_METHODS = {
  SELF_PICKUP: "self_pickup", // Ambil sendiri di toko
  COURIER: "courier", // Diantar kurir
};

// Informasi toko
exports.STORE_LOCATION = {
  name: "Ahmad Tailor",
  address: "Jl. Pegadungan Raya No. 2",
  area: "Kalideres",
  city: "Jakarta Barat",
  postalCode: "11830",
  phone: "021-1234567",
  whatsapp: "0812-3456-7890",
};
