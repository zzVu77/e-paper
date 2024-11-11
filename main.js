import express from "express";
import { engine } from "express-handlebars";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
// const path = require("path");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: join(__dirname, "/views/layouts/"),
    partialsDir: join(__dirname, "/views/partials/"),
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/features", function (req, res) {
  res.render("features");
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("ecApp is running at http://localhost:3000");
});
