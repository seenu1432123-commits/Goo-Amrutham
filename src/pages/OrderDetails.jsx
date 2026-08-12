import React from "react";
import {Link,useParams} from "react-router-dom";
import {FaWhatsapp} from "react-icons/fa";
import {useApp} from "../context/AppContext";
import StatusTimeline from "../components/StatusTimeline";

export default function OrderDetails(){
 const {id}=useParams(); const {orders,currentUser}=useApp(); const o=orders.find(x=>x.id===id && (x.userId===currentUser?.id || currentUser?.role==="admin"));
 if(!o) return <main className="page"><div className="container empty-state"><h1>Order not found</h1><Link to="/orders">Back to orders</Link></div></main>;
 const msg=`Hello Goo Amrutham Milk, I am checking my order ${o.id}. Current status: ${o.status}.`;
 return <main className="page"><div className="container"><div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><span className="eyebrow">ORDER TRACKING</span><h1>{o.order_number || o.id}</h1><p className="mb-0">{new Date(o.createdAt).toLocaleString()} · {o.slot} · {o.frequency}</p></div><a className="btn btn-success rounded-pill" target="_blank" rel="noreferrer" href={`https://wa.me/917337382082?text=${encodeURIComponent(msg)}`}><FaWhatsapp/> WhatsApp Support</a></div><div className="row g-4"><div className="col-lg-7"><div className="form-card"><h4>Delivery progress</h4><StatusTimeline order={o}/></div></div><div className="col-lg-5"><div className="summary-card"><h4>Order details</h4>{o.items.map(i=><div className="summary-line" key={i.id}><span>{i.unit} × {i.qty}</span><b>₹{i.lineTotal}</b></div>)}<hr/><div className="summary-line"><span>Delivery</span><b>{o.deliveryFee?"₹"+o.deliveryFee:"FREE"}</b></div><div className="summary-line total"><span>Total</span><b>₹{o.total}</b></div><p className="small mt-3 mb-0"><b>Deliver to:</b><br/>{o.customer.address}, {o.customer.city} - {o.customer.pincode}</p></div></div></div></div></main>
}