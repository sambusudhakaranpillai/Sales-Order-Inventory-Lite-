import React, { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    dealer: "",
    items: [
      {
        product: "",
        quantity: "",
      },
    ],
  });
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await api.get("orders/");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchDealers = async () => {
    try {
      const res = await api.get("dealers/");
      setDealers(res.data);
    } catch (error) {
      console.error("Error fetching dealers:", error);
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
    fetchOrders();
    fetchDealers();
    fetchProducts();
  }, []);

  const handleDealerChange = (e) => {
    setForm({
      ...form,
      dealer: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const updatedItems = [...form.items];
    updatedItems[index][e.target.name] = e.target.value;

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { product: "", quantity: "" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        dealer: Number(form.dealer),
        items: form.items.map((item) => ({
          product: Number(item.product),
          quantity: Number(item.quantity),
        })),
      };

      await api.post("orders/", payload);

      setMessage("Order created successfully");
      setForm({
        dealer: "",
        items: [{ product: "", quantity: "" }],
      });
      fetchOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Failed to create order");
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.post(`orders/${id}/confirm/`);
      setMessage("Order confirmed successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error confirming order:", error);
      setMessage("Failed to confirm order");
    }
  };

  const handleDeliver = async (id) => {
    try {
      await api.post(`orders/${id}/deliver/`);
      setMessage("Order delivered successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error delivering order:", error);
      setMessage("Failed to deliver order");
    }
  };

  return (
    <div>
      <h2>Orders</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <select
          name="dealer"
          value={form.dealer}
          onChange={handleDealerChange}
          required
        >
          <option value="">Select Dealer</option>
          {dealers.map((dealer) => (
            <option key={dealer.id} value={dealer.id}>
              {dealer.name}
            </option>
          ))}
        </select>

        {form.items.map((item, index) => (
          <div key={index} className="item-row">
            <select
              name="product"
              value={item.product}
              onChange={(e) => handleItemChange(index, e)}
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
          </div>
        ))}

        <button type="button" onClick={addItemRow}>
          Add Item
        </button>

        <button type="submit">Create Order</button>
      </form>

      {message && <p>{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order Number</th>
            <th>Dealer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
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
              <td>
                <button
                  onClick={() => handleConfirm(item.id)}
                  disabled={item.status !== "draft"}
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleDeliver(item.id)}
                  disabled={item.status !== "confirmed"}
                  style={{ marginLeft: "8px" }}
                >
                  Deliver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Orders;