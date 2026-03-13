import React, { useEffect, useState } from "react";
import api from "../services/api";

function Dealers() {
  const [dealers, setDealers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    dealer_code: "",
    email: "",
    phone: "",
    address: "",
    is_active: true,
  });

  const [message, setMessage] = useState("");

  const fetchDealers = async () => {
    try {
      const res = await api.get("dealers/");
      setDealers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("dealers/", form);

      setMessage("Dealer added successfully");

      setForm({
        name: "",
        dealer_code: "",
        email: "",
        phone: "",
        address: "",
        is_active: true,
      });

      fetchDealers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to add dealer");
    }
  };

  return (
    <div>
      <h2>Dealers</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <input
          type="text"
          name="name"
          placeholder="Dealer Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="dealer_code"
          placeholder="Dealer Code"
          value={form.dealer_code}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active
        </label>

        <button type="submit">Add Dealer</button>
      </form>

      {message && <p>{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Dealer Code</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Active</th>
          </tr>
        </thead>

        <tbody>
          {dealers.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.dealer_code}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>{item.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dealers;