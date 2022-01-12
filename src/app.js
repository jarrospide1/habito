//---Require express & path----

const express = require("express");
const app = express();
const path = require("path");

const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

app.listen(3000, () => {
    console.log("Servidor corriendo")
});

// Setup template engine
app.set('view engine', 'ejs');

// Setup del req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


mainRoutes = require('./routes/main');
app.use("/", mainRoutes);

productsRoutes = require("./routes/products");
app.use("/products", productsRoutes);

usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);

