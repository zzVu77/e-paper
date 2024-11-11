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
    partialsDir: join(__dirname, "/views/components/"),
  })
);

app.set("view engine", "hbs");
app.set("views", "./views/pages");
app.use(express.static("public"));

app.get("/all-posts", function (req, res) {
  res.render("posts");
});

app.get("/features", function (req, res) {
  res.render("features");
});
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/admin", function (req, res) {
  res.render("admin/dashboard", { layout: "admin", title: "Admin Dashboard" });
});

app.listen(3000, function () {
  console.log("ecApp is running at http://localhost:3000");
});
