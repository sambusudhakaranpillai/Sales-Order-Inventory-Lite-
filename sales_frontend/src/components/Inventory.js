import React, { useEffect, useState } from "react";
import api from "../services/api";

function Inventory() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api.get("inventory/")
      .then((res) => setInventory(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.product_name}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;