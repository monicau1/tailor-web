// middlewares/cartMiddleware.js
exports.cartItemCount = (req, res, next) => {
  // Pastikan cart ada di session
  if (!req.session.cart) {
    req.session.cart = {
      pakaian: [],
      permak: [],
    };
  }

  // Hitung total item di keranjang jahit (pakaian)
  const totalPakaian = req.session.cart.pakaian.reduce((sum, item) => {
    return sum + (item.kuantitas || 1);
  }, 0);

  // Hitung total item di keranjang permak
  const totalPermak = req.session.cart.permak.reduce((sum, item) => {
    return sum + (item.DetailPermak?.length || 0);
  }, 0);

  // Set total ke res.locals agar bisa diakses di view
  res.locals.cartItemCount = totalPakaian + totalPermak;

  next();
};
