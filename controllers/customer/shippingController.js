// controllers/customer/shippingController.js
const {
  SHIPPING_AREAS,
  STORE_LOCATION,
  DELIVERY_METHODS,
  RETURN_METHODS,
} = require("../../shared/utils/shippingConfig");
// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

exports.getAreas = (req, res) => {
  try {
    const areas = Object.keys(SHIPPING_AREAS)
      .filter((area) => SHIPPING_AREAS[area].isDeliveryAvailable)
      .map((area) => ({
        name: area,
        zone: SHIPPING_AREAS[area].zone,
        cost: SHIPPING_AREAS[area].cost,
        returnCost: SHIPPING_AREAS[area].returnCost,
      }));

    res.json({
      success: true,
      data: {
        areas,
        store: STORE_LOCATION,
      },
    });
  } catch (error) {
    console.error("Error getting shipping areas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data area",
    });
  }
};

exports.calculateShipping = async (req, res) => {
  try {
    const { destination, returnDelivery } = req.body;

    // Validasi area pengiriman
    const area = SHIPPING_AREAS[destination];
    if (!area || !area.isDeliveryAvailable) {
      return res.status(400).json({
        success: false,
        message: "Area pengiriman tidak tersedia",
      });
    }

    // Hitung biaya
    const deliveryCost = area.cost;
    const returnCost = returnDelivery === "courier" ? area.returnCost : 0;
    const totalCost = deliveryCost + returnCost;

    // Hitung estimasi waktu
    let estimatedDelivery = "2-3 hari";
    if (area.zone === 1) {
      estimatedDelivery = "1 hari";
    } else if (area.zone === 2) {
      estimatedDelivery = "1-2 hari";
    }

    res.json({
      success: true,
      data: {
        area: destination,
        deliveryCost,
        returnCost,
        totalCost,
        estimatedDelivery,
        zone: area.zone,
      },
    });
  } catch (error) {
    console.error("Error calculating shipping:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghitung biaya pengiriman",
    });
  }
};

exports.validateAddress = (req, res) => {
  try {
    const { area } = req.body;

    // Cek apakah area ada dalam daftar area yang dilayani
    const validArea = SHIPPING_AREAS[area];
    if (!validArea) {
      return res.json({
        success: false,
        message: "Area tidak dilayani pengiriman",
      });
    }

    // Cek apakah pengiriman tersedia untuk area tersebut
    if (!validArea.isDeliveryAvailable) {
      return res.json({
        success: false,
        message: "Pengiriman tidak tersedia untuk area ini",
      });
    }

    res.json({
      success: true,
      data: {
        area: area,
        zone: validArea.zone,
        isDeliveryAvailable: validArea.isDeliveryAvailable,
        isPickupAvailable: validArea.isPickupAvailable,
        cost: validArea.cost,
        returnCost: validArea.returnCost,
      },
    });
  } catch (error) {
    console.error("Error validating address:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat validasi alamat",
    });
  }
};

exports.getStoreLocation = (req, res) => {
  try {
    res.json({
      success: true,
      data: STORE_LOCATION,
    });
  } catch (error) {
    console.error("Error getting store location:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil informasi toko",
    });
  }
};

exports.getDeliveryOptions = (req, res) => {
  try {
    const { area } = req.query;

    // Get area details
    const areaDetails = SHIPPING_AREAS[area];

    const options = {
      delivery: [
        {
          id: DELIVERY_METHODS.SELF_DROPOFF,
          name: "Antar Sendiri ke Toko",
          cost: 0,
          estimatedTime: "1 hari kerja",
          description: "Antar langsung ke alamat toko kami",
        },
      ],
      return: [
        {
          id: RETURN_METHODS.SELF_PICKUP,
          name: "Ambil Sendiri di Toko",
          cost: 0,
          estimatedTime: "1 hari kerja",
          description: "Ambil langsung di toko setelah pakaian selesai",
        },
      ],
    };

    // Add courier options if available for the area
    if (areaDetails?.isDeliveryAvailable) {
      options.delivery.push({
        id: DELIVERY_METHODS.COURIER,
        name: "Kurir Toko",
        cost: areaDetails.cost,
        estimatedTime: `${areaDetails.zone === 1 ? "1" : "2-3"} hari kerja`,
        description: "Dijemput oleh kurir toko kami",
      });

      if (areaDetails.isPickupAvailable) {
        options.return.push({
          id: RETURN_METHODS.COURIER,
          name: "Diantar Kurir Toko",
          cost: areaDetails.returnCost,
          estimatedTime: `${areaDetails.zone === 1 ? "1" : "2-3"} hari kerja`,
          description: "Diantar oleh kurir toko kami",
        });
      }
    }

    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Error getting delivery options:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil opsi pengiriman",
    });
  }
};

module.exports = exports;
