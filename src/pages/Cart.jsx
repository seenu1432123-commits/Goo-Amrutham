import React from "react";
import {Link,useNavigate} from "react-router-dom";
import {FaMinus,FaPlus,FaTrash,FaArrowRight} from "react-icons/fa";
import {useApp} from "../context/AppContext";
import {
  openWhatsApp,
  createCartWhatsAppMessage,
} from "../utils/whatsapp";

export default function Cart(){
    const navigate = useNavigate();
 const {cartItems,cartTotal,deliveryFee,updateCart}=useApp();
 if(!cartItems.length) return <main className="page"><div className="container empty-state"><div className="empty-icon">🛒</div><h1>Your cart is empty</h1><p>Add fresh milk to get started.</p><Link className="btn btn-success rounded-pill px-4" to="/products">Browse Milk</Link></div></main>;
 return <main className="page"><div className="container"><div className="page-head"><span className="eyebrow">YOUR BASKET</span><h1>Ready to order?</h1></div><div className="row g-4"><div className="col-lg-8">{cartItems.map(i=><div className="cart-row" key={i.id}><img src={i.image} alt=""/><div className="flex-grow-1"><b>{i.name}</b><small>{i.unit}</small><strong>₹{i.price}</strong></div><div className="qty"><button onClick={()=>updateCart(i.id,i.qty-1)}><FaMinus/></button><span>{i.qty}</span><button onClick={()=>updateCart(i.id,i.qty+1)}><FaPlus/></button></div><button className="icon-btn danger" onClick={()=>updateCart(i.id,0)}><FaTrash/></button></div>)}</div><div className="col-lg-4"><div className="summary-card"><h4>Order summary</h4><div><span>Subtotal</span><b>₹{cartTotal}</b></div><div><span>Delivery</span><b>{deliveryFee?"₹"+deliveryFee:"FREE"}</b></div><hr/><div className="total"><span>Total</span><b>₹{cartTotal+deliveryFee}</b></div>
<button
  className="btn btn-success btn-lg w-100 rounded-pill fw-bold"
  onClick={() => navigate("/checkout")}
>
  Proceed to Checkout
</button>     <small className="d-block mt-3 text-muted">You can choose your delivery slot on the next step.</small></div></div></div></div></main>
}
<button
  type="button"
  className="btn btn-success rounded-pill px-4"
  onClick={() =>
    openWhatsApp(
      createCartWhatsAppMessage(cartItems)
    )
  }
>
  <i className="bi bi-whatsapp me-2"></i>
  Order on WhatsApp
</button>