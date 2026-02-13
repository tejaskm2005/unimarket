import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SellPage = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        title: title,
        price: price,
      });
      alert("Item Listed Successfully! 🚀");
      navigate('/'); 
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-xl rounded-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-6">Sell an Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          className="w-full border p-3 rounded-lg bg-slate-50"
          placeholder="Item Name" 
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          className="w-full border p-3 rounded-lg bg-slate-50"
          placeholder="Price (₹)" 
          type="number"
          onChange={(e) => setPrice(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
          List Item
        </button>
      </form>
    </div>
  );
};

export default SellPage;