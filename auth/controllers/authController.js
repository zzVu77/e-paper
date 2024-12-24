import passport from "passport";

const login = async (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);

        // If no user was found
        if (!user) {
            // Custom handling for specific cases
            if (info && info.message === "Account does not exist") {
                return res.status(401).json({ error: "The account does not exist in the database." });
            }
            if (info && info.provider) {
                return res.status(401).json({
                    error: `The email is used with ${info.provider}. Please try logging in with ${info.provider}.`
                });
            }
            // General error message
            return res.status(401).json({ error: info?.message || "Login failed." });
        }

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({ message: "Logged in successfully" });
        });
    })(req, res, next);
};

const authCallback = (req, res) => {
    res.redirect("/");
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
    authCallback(req, res);
};

export default { login, authCallback, logout };
