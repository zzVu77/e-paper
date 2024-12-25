function ensureAuthenticated(req, res, next) {
  if (req.user) {
    return next();
  }
  res.redirect("/login");
}
function authAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    res.redirect("/login");
  }
}
function authEditor(req, res, next) {
  if (req.user && req.user.role === "editor") {
    return next();
  } else {
    res.redirect("/login");
  }
}
function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Forbidden. Admins only." });
}
function ensureWriter(req, res, next) {
  if (req.user && (req.user.role === "writer" || req.user.role === "admin")) {
    return next();
  }
  res.render("404");
}
export default {
  ensureAuthenticated,
  ensureAdmin,
  authAdmin,
  authEditor,
  ensureWriter,
};
