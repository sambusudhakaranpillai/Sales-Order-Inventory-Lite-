# Inventory Management System (IMS)

## Project Overview

This project is a backend-driven Inventory Management System built using Django and Django REST Framework.  
It allows administrators to manage products, dealers, inventory, and orders while ensuring inventory is automatically updated when orders are confirmed.

The system supports the following workflow:

1. Admin creates products
2. Admin adds inventory
3. Admin creates dealers
4. Dealers place draft orders
5. Orders can be confirmed (stock validation happens)
6. Orders can be marked as delivered

Inventory is automatically reduced when an order is confirmed.

---

# Features Implemented

• Product management (create, list, update)  
• Dealer management  
• Inventory tracking per product  
• Order creation with multiple items  
• Draft order editing  
• Order confirmation with stock validation  
• Automatic inventory deduction on confirmation  
• Mark orders as delivered  
• Inventory adjustment endpoint for admin  

---

# Tech Stack

Backend
- Python
- Django
- Django REST Framework

Frontend
- React.js
- Axios

Database
- SQLite

Tools
- Git
- GitHub
- Postman (for API testing)

---

# Project Structure
Sales-Order-system
│
├── inventory
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│
├── sales_order_system
│   ├── settings.py
│   ├── urls.py
│
├── sales_frontend
│
├── manage.py
├── requirements.txt
└── README.md

Setup Instructions 
git clone https://github.com/sambusudhakaranpillai/Sales-Order-Inventory-Lite.git
cd Sales-Order-Inventory-Lite
Create Virtual Environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 
http://127.0.0.1:8000/
Frontend Setup
cd sales_frontend
npm install
http://localhost:3000
API Endpoints
Products
Method	Endpoint	Description
GET	/api/products/	List products
POST	/api/products/	Create product
PUT	/api/products/{id}/	Update product

Dealers
Method	Endpoint	Description
GET	/api/dealers/	List dealers
POST	/api/dealers/	Create dealer

Orders
Method	Endpoint	Description
GET	/api/orders/	List orders
POST	/api/orders/	Create draft order
GET	/api/orders/{id}/	Get order with items
PUT	/api/orders/{id}/	Update draft order
POST	/api/orders/{id}/confirm/	Confirm order
POST	/api/orders/{id}/deliver/	Mark order delivered

Inventory
Method	Endpoint	Description
GET	/api/inventory/	List inventory
PUT	/api/inventory/{product_id}/	Adjust inventory

Example API Request
{
  "dealer": 1,
  "items": [
    {
      "product": 1,
      "quantity": 2
    }
  ]
}
Response
{
  "id": 1,
  "status": "draft",
  "dealer": 1,
  "items": [
    {
      "product": 1,
      "quantity": 2
    }
  ]
}

Database Schema
Dealer
 └── name

Product
 └── name
 └── price
 └── sku

Inventory
 └── product
 └── quantity
 └── updated_by

Order
 └── dealer
 └── status
 └── created_at

OrderItem
 └── order
 └── product
 └── quantity
 └── unit_price

 Assumptions

Only draft orders can be edited

Orders must be confirmed before delivery

Inventory is reduced only when order is confirmed

Delivered orders cannot be modified

Inventory adjustment endpoint is used only for admin corrections