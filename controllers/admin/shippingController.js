const {
  calculateShipping,
  getProvinces,
  getCities,
} = require("../../utils/rajaOngkir");

// Get daftar provinsi
exports.getProvinces = async (req, res) => {
  try {
    const provinces = await getProvinces();
    res.json({ success: true, data: provinces });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get daftar kota berdasarkan provinsi
exports.getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const cities = await getCities(provinceId);
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Hitung ongkir
exports.calculateShipping = async (req, res) => {
  try {
    const { destination, weight } = req.body;

    if (!destination || !weight) {
      return res.status(400).json({
        success: false,
        message: "Destinasi dan berat harus diisi",
      });
    }

    const result = await calculateShipping(destination, weight);

    res.json({
      success: true,
      data: {
        cost: result.cost,
        estimation: `${result.etd} hari`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
