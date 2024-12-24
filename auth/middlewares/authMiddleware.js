function ensureAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
}

export { ensureAuthenticated }; 

