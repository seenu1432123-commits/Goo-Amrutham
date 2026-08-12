import React from "react";
import {Link} from "react-router-dom";
import {useApp} from "../context/AppContext";
import {FaArrowRight,FaRedo} from "react-icons/fa";

export default function Orders(){
 const {currentUser,orders,addToCart}=useApp();
 const mine=orders.filter(o=>o.userId===currentUser?.id);
 const reorder=o=>o.items.forEach(i=>addToCart(i.id,i.qty));
 return <main className="page"><div className="container"><div className="page-head"><span className="eyebrow">ACCOUNT</span><h1>My orders</h1><p>Track delivery progress and quickly reorder previous baskets.</p></div>{!mine.length?<div className="empty-state"><div className="empty-icon">🥛</div><h2>No orders yet</h2><Link className="btn btn-success rounded-pill" to="/products">Place your first order</Link></div>:<div className="order-grid">{mine.map(o=><div className="order-card" key={o.id}><div className="d-flex justify-content-between gap-3"><div><span className="order-id">{o.id}</span><h5>{o.items.map(i=>`${i.unit} × ${i.qty}`).join(" · ")}</h5><small>{new Date(o.createdAt).toLocaleString()}</small></div><span className={`status status-${o.status.toLowerCase().replaceAll(" ","-")}`}>{o.status}</span></div><div className="order-meta"><span>{o.slot} delivery</span><b>₹{o.total}</b></div><div className="d-flex gap-2 flex-wrap"><Link className="btn btn-sm btn-outline-success rounded-pill" to={`/orders/${o.id}`}>Track <FaArrowRight/></Link><button className="btn btn-sm btn-success rounded-pill" onClick={()=>reorder(o)}><FaRedo/> Reorder</button></div></div>)}</div>}</div></main>
}