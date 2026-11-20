const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  return next(error);
});

let products = [];
let nextId = 1;

function isValidProduct(body) {
  return (
    body &&
    typeof body.name === "string" &&
    body.name.trim() !== "" &&
    typeof body.price === "number" &&
    Number.isFinite(body.price) &&
    typeof body.category === "string" &&
    body.category.trim() !== ""
  );
}

app.post("/api/products", (req, res) => {
  if (!isValidProduct(req.body)) {
    return res.status(400).json({ message: "Missing or invalid product data" });
  }

  const name = req.body.name.trim();
  const duplicate = products.some(
    (product) => product.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({ message: "Product name already exists" });
  }

  const product = {
    id: nextId++,
    name,
    price: req.body.price,
    category: req.body.category.trim(),
  };

  products.push(product);
  return res.status(201).json(product);
});

app.get("/api/products", (req, res) => {
  if (req.query.category) {
    const category = String(req.query.category).toLowerCase();
    const filtered = products.filter(
      (product) => product.category.toLowerCase() === category
    );
    return res.status(200).json(filtered);
  }

  return res.status(200).json(products);
});

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(200).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!isValidProduct(req.body)) {
    return res.status(400).json({ message: "Missing or invalid product data" });
  }

  const name = req.body.name.trim();
  const duplicate = products.some(
    (product, productIndex) =>
      productIndex !== index &&
      product.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    return res.status(409).json({ message: "Product name already exists" });
  }

  const updatedProduct = {
    id,
    name,
    price: req.body.price,
    category: req.body.category.trim(),
  };

  products[index] = updatedProduct;
  return res.status(200).json(updatedProduct);
});

app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deletedProduct = products[index];
  products.splice(index, 1);
  return res.status(200).json(deletedProduct);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Products API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
