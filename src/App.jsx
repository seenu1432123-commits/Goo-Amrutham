import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import BackButton from "./components/BackButton";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Subscription from "./pages/Subscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <BackButton />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Products */}
        <Route
          path="/products"
          element={<Products />}
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* Checkout */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* Subscriptions */}
        <Route
          path="/subscriptions"
          element={<Subscription />}
        />

        {/* Subscription Details */}
        <Route
          path="/subscribe-details"
          element={<SubscriptionDetails />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/update-password"
          element={<UpdatePassword />}
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<Admin />}
        />

        {/* Static pages */}
        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Home />}
        />

      </Routes>

      <WhatsAppButton />

      <Footer />
    </BrowserRouter>
  );
}