const express = require("express")
const fs = require("fs")
const path = require("path")

const PORT = 8080

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")))

app.get("/products", (req,res) => {
    fs.readFile(path.join(__dirname, "products.json"), "utf8", (err, data) => {
        if (err && err.code !== "ENOENT") {
            return res.status(500).json({ error: "Failed to read products" });
        }

        const products = data ? JSON.parse(data) : {};

        res.json(products);
    })
})
app.get("/homepage", (req,res) => {
    res.sendFile(path.join(__dirname, "public", "shop", "shop.html"))
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`http://localhost:${PORT}`)
})