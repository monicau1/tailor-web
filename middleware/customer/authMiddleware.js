// middlewares/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Silakan login terlebih dahulu");
    return res.redirect("/auth/login");
  }
  next();
};

exports.setLocals = (req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.user = {
    id: req.session.userId,
    email: req.session.userEmail,
    name: req.session.userName,
  };
  next();
};
