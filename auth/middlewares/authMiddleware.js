function ensureAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
    res.redirect('/login'); 
};

function authAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      return next(); 
    } else {
      res.redirect('/login'); 
    }
}

function authEditor(req, res, next) {
  if (req.user && req.user.role === 'editor') {
    return next(); 
  } else {
    res.redirect('/login'); 
  }
}
export default { ensureAuthenticated, authAdmin,authEditor };

