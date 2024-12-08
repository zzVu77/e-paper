import bcrypt from "bcrypt";
import knex from "../../utils/db.js";

const signup = async (req, res) => {
    const { name, email, password, birthdate, role = "subscriber" } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await knex("users").insert({ name, email, password: hashedPassword, birthdate, role });
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: "Error creating user" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await knex("users").where({ email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        req.session.user = user;
        res.json({ message: "Logged in successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error logging in" });
    }
};

const oauthCallback = (req, res) => {
    res.redirect("/");
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
    oauthCallback(req, res);
};

export default { signup, login, oauthCallback, logout };
