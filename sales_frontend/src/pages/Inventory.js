import React, { useEffect, useState } from "react";
import api from "../services/api";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    updated_by: "admin",
  });
  const [message, setMessage] = useState("");

  const fetchInventory = async () => {
    try {
      const res = await api.get("inventory/");
      setInventory(res.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("products/");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("inventory/", form);
      setMessage("Inventory added successfully");
      setForm({
        product: "",
        quantity: "",
        updated_by: "admin",
      });
      fetchInventory();
    } catch (error) {
      console.error("Error adding inventory:", error);
      setMessage("Failed to add inventory");
    }
  };

  return (
    <div>
      <h2>Inventory</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <select
          name="product"
          value={form.product}
          onChange={handleChange}
          required
        >
          <option value="">Select Product</option>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.sku})
            </option>
          ))}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="updated_by"
          placeholder="Updated By"
          value={form.updated_by}
          onChange={handleChange}
        />

        <button type="submit">Add Inventory</button>
      </form>

      {message && <p>{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Updated By</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.product_name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{item.updated_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;