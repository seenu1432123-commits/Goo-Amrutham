import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {useApp} from "../context/AppContext";
import logo from "../assets/images/logo.jpeg";

export default function Register(){
 const {register,supabaseConfigured}=useApp(); const nav=useNavigate(); const [f,setF]=useState({name:"",phone:"",email:"",password:""}); const [e,setE]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 const submit=async x=>{x.preventDefault();setE("");setMessage("");setBusy(true);try{const r=await register(f);if(r.needsEmailConfirmation){setMessage("Account created. Please check your email and confirm your account before signing in.");}else nav("/");}catch(err){setE(err.message)}finally{setBusy(false)}};
 return <main className="auth-page"><div className="auth-card"><img src={logo} className="auth-logo" alt="Goo Amrutham"/><span className="eyebrow">JOIN GOO AMRUTHAM</span><h1>Create account</h1><p>Save your details and track every order.</p>{!supabaseConfigured&&<div className="alert alert-warning">Configure Supabase first using the included <code>.env.example</code>.</div>}{e&&<div className="alert alert-danger">{e}</div>}{message&&<div className="alert alert-success">{message}</div>}<form onSubmit={submit}>
 <label>Full name<input className="form-control" required value={f.name} onChange={x=>setF({...f,name:x.target.value})}/></label>
 <label>Mobile number<input className="form-control" required pattern="[0-9]{10}" value={f.phone} onChange={x=>setF({...f,phone:x.target.value})}/></label>
 <label>Email<input type="email" className="form-control" required value={f.email} onChange={x=>setF({...f,email:x.target.value})}/></label>
 <label>Password<input type="password" className="form-control" required minLength="8" value={f.password} onChange={x=>setF({...f,password:x.target.value})}/></label>
 <button disabled={busy||!supabaseConfigured} className="btn btn-success w-100 btn-lg rounded-pill">{busy?"Creating…":"Create Account"}</button></form><p className="small mt-4 mb-0">Already registered? <Link to="/login">Sign in</Link></p></div></main>;
}
