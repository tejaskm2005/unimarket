import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, PlusCircle, LogOut, User } from 'lucide-react';
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase"; // <--- Correct Path

export default function Navbar({ user, setUser }) {

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tighter">
        <ShoppingBag strokeWidth={2.5} />
        UniMarket
      </Link>

      {/* Menu */}
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/sell" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700 transition">
              <PlusCircle size={18} />
              Sell Item
            </Link>
            
            <div className="flex items-center gap-3 ml-2">
              <img src={user.photoURL} className="w-9 h-9 rounded-full border border-slate-300" alt="User" />
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-full transition"
          >
            <User size={18} />
            Login
          </button>
        )}
      </div>
    </nav>
  );
}