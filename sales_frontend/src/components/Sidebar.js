import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">IMS</h2>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/dealers">Dealers</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/orders">Orders</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;