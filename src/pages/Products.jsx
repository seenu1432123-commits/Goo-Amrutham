import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function Products() {
  return <main className="page"><div className="container"><div className="page-head"><span className="eyebrow">OUR MILK</span><h1>Fresh milk for every routine.</h1><p>Pick a quantity, add it to your cart and choose your delivery preference at checkout.</p></div><div className="row g-4">{products.map(p=><div className="col-md-6 col-lg-4" key={p.id}><ProductCard product={p}/></div>)}</div><div className="info-banner mt-5"><b>Tip:</b> Orders of ₹200 or more get free delivery in this demo storefront.</div></div></main>;
}