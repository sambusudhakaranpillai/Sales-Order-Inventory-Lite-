import React, { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("orders/")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Orders</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order Number</th>
            <th>Dealer</th>
            <th>Status</th>
            <th>Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.order_number}</td>
              <td>{item.dealer_name}</td>
              <td>{item.status}</td>
              <td>{item.total_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;