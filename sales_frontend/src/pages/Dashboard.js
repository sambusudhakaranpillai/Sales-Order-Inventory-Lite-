import React, { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [counts, setCounts] = useState({
    products: 0,
    dealers: 0,
    inventory: 0,
    orders: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [productsRes, dealersRes, inventoryRes, ordersRes] = await Promise.all([
          api.get("products/"),
          api.get("dealers/"),
          api.get("inventory/"),
          api.get("orders/"),
        ]);

        setCounts({
          products: productsRes.data.length,
          dealers: dealersRes.data.length,
          inventory: inventoryRes.data.length,
          orders: ordersRes.data.length,
        });
      } catch (error) {
        console.error("Error loading dashboard counts:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="cards">
        <div className="card">
          <h3>Products</h3>
          <p>{counts.products}</p>
        </div>
        <div className="card">
          <h3>Dealers</h3>
          <p>{counts.dealers}</p>
        </div>
        <div className="card">
          <h3>Inventory</h3>
          <p>{counts.inventory}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p>{counts.orders}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;