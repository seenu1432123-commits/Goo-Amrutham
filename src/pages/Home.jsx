import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaTruck, FaGlassWhiskey, FaSeedling, FaArrowRight } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";
import { testimonials, faqs } from "../data/content";
import hero from "../assets/images/hero-field.jpeg";
import family from "../assets/images/family-organic.jpeg";
import homeBottle from "../assets/images/home-bottle.jpeg";
import logo from "../assets/images/logo.jpeg";

export default function Home() {
  return <main>
    <section className="hero">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="eyebrow"><FaLeaf/> FROM OUR FARMS TO YOUR HOME</span>
            <h1>Fresh milk.<br/><span>Simple delivery.</span></h1>
            <p className="lead">Order Goo Amrutham Milk online, choose your delivery slot and track every order from confirmation to doorstep.</p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-success btn-lg rounded-pill px-4">Order Fresh Milk <FaArrowRight/></Link>
              <Link to="/about" className="btn btn-outline-success btn-lg rounded-pill px-4">Our Story</Link>
            </div>
            <div className="mini-trust mt-4"><span>✓ Fresh daily</span><span>✓ Glass bottle</span><span>✓ Home delivery</span></div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image-card"><img src={hero} alt="Goo Amrutham milk in a green field"/><div className="hero-badge"><b>₹80</b><span>per litre</span></div></div>
          </div>
        </div>
      </div>
    </section>

    <section className="trust-strip"><div className="container"><div className="row g-3">
      {[[FaLeaf,"Natural focus","Thoughtful sourcing"],[FaGlassWhiskey,"Eco packaging","Reusable glass bottle"],[FaTruck,"Home delivery","Choose your slot"],[FaSeedling,"Farmer first","Support local farming"]].map(([Icon,a,b])=><div className="col-6 col-lg-3" key={a}><div className="trust-card"><Icon/><div><b>{a}</b><small>{b}</small></div></div></div>)}
    </div></div></section>

    <section className="section-pad"><div className="container"><div className="section-heading"><div><span className="eyebrow">SHOP</span><h2>Choose your daily milk</h2></div><Link to="/products" className="text-success fw-bold">View all <FaArrowRight/></Link></div><div className="row g-4">{products.map(p=><div className="col-md-4" key={p.id}><ProductCard product={p}/></div>)}</div></div></section>

    <section className="story-section section-pad"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-6"><img className="story-img" src={family} alt="Family enjoying milk"/></div><div className="col-lg-6"><span className="eyebrow">THE GOO AMRUTHAM WAY</span><h2>From the farm to your family table.</h2><p>Our website is designed around one simple idea: make ordering local milk as easy as ordering anything online, while keeping the experience warm and personal.</p><div className="check-list"><div>✓ Easy online ordering</div><div>✓ WhatsApp order sharing</div><div>✓ Order status tracking</div><div>✓ Quick reorder from history</div></div><Link to="/about" className="btn btn-dark rounded-pill mt-3">Discover our story</Link></div></div></div></section>

    <section className="section-pad"><div className="container"><div className="section-heading"><div><span className="eyebrow">WHY US</span><h2>Built for everyday families</h2></div></div><div className="row g-4">{["Fresh & convenient","Track every order","WhatsApp support","Simple subscriptions"].map((x,i)=><div className="col-sm-6 col-lg-3" key={x}><div className="feature-box"><div className="feature-num">0{i+1}</div><h5>{x}</h5><p>Everything you need for a smooth milk delivery routine.</p></div></div>)}</div></div></section>

    <section className="cta-section"><div className="container"><div className="cta-card"><div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Make your morning milk one tap away.</h2><p>Sign in, add your quantity and place your order in minutes.</p></div><Link to="/products" className="btn btn-light btn-lg rounded-pill">Start Ordering</Link></div></div></section>

    <section className="section-pad"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-5"><img src={homeBottle} className="clean-bottle" alt="Goo Amrutham milk bottle"/></div><div className="col-lg-7"><span className="eyebrow">A BETTER ROUTINE</span><h2>Know where your order is.</h2><p>Once you place an order, your account keeps the details in one place. Check status, delivery slot, order total and reorder in seconds.</p><div className="row g-3"><div className="col-sm-6"><div className="soft-card"><b>Live status timeline</b><small>Placed → Confirmed → Preparing → Delivery → Delivered</small></div></div><div className="col-sm-6"><div className="soft-card"><b>Fast reorder</b><small>Repeat a previous basket without rebuilding it.</small></div></div></div></div></div></div></section>

    <section className="section-pad bg-soft"><div className="container"><div className="section-heading"><div><span className="eyebrow">REVIEWS</span><h2>What customers say</h2></div></div><div className="row g-4">{testimonials.map(t=><div className="col-md-4" key={t.name}><div className="review-card"><div className="stars">★★★★★</div><p>“{t.text}”</p><b>{t.name}</b></div></div>)}</div></div></section>

    <section className="section-pad"><div className="container"><div className="section-heading"><div><span className="eyebrow">FAQ</span><h2>Common questions</h2></div></div><div className="accordion" id="faq">{faqs.map(([q,a],i)=><div className="accordion-item" key={q}><h2 className="accordion-header"><button className={`accordion-button ${i?"collapsed":""}`} data-bs-toggle="collapse" data-bs-target={`#f${i}`}>{q}</button></h2><div id={`f${i}`} className={`accordion-collapse collapse ${i===0?"show":""}`} data-bs-parent="#faq"><div className="accordion-body">{a}</div></div></div>)}</div></div></section>
  </main>;
}