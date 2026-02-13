import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center mt-20 p-5">
      <h1 className="text-5xl font-black mb-6 text-blue-900">UniMarket</h1>
      <p className="text-xl text-slate-500 mb-8">The Campus Marketplace</p>
      
      <Link to="/sell">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all">
          + Sell Item
        </button>
      </Link>
    </div>
  );
};

export default HomePage;