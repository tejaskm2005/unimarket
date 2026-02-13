import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ShoppingBag, Plus, LogOut, User, Sun, Moon, Tag, X, ChevronLeft, ChevronRight, Search, Trash2, Filter, CreditCard, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'; 
import emailjs from '@emailjs/browser'; // Make sure you ran: npm install @emailjs/browser

// --- PASTE YOUR KEYS HERE ---
const SERVICE_ID = "service_oc53nla";   // e.g. "service_z93..."
const TEMPLATE_ID = "template_0oltzgg"; // e.g. "template_a1b..."
const PUBLIC_KEY = "vvGOfFOqaCSD7b2IZ";   // e.g. "Wz9_..."

// --- NAVBAR ---
const Navbar = ({ user, setUser, darkMode, setDarkMode }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-void/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-violet-600 dark:bg-neon text-white dark:text-black p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-violet-500/30 dark:shadow-neon/50">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            UniMarket<span className="text-violet-600 dark:text-neon">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-neon hover:scale-110 transition-transform">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <>
              <Link to="/sell" className="flex items-center gap-2 bg-slate-900 dark:bg-neon text-white dark:text-black px-5 py-2.5 rounded-full font-bold hover:scale-105 transition-all shadow-lg dark:shadow-neon/20">
                <Plus size={18} /> <span className="hidden sm:inline">Sell Item</span>
              </Link>
              <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-white dark:border-neon shadow-sm" alt="Profile" />
              <button onClick={() => { signOut(auth); setUser(null); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
            </>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 text-slate-700 dark:text-white font-bold hover:text-violet-600 dark:hover:text-neon px-4 py-2 rounded-full transition-all"><User size={20} /> Login</button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- HOME PAGE (THE BUYING PAGE) ---
const HomePage = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false); 
  const [sendingEmail, setSendingEmail] = useState(false); // Loading spinner for email
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Buyer Form State
  const [buyerName, setBuyerName] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [buyerMessage, setBuyerMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const categories = ["All", "Books", "Electronics", "Furniture", "Clothing", "Other"];

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    setIsCheckout(false);
    setOrderSuccess(false);
    setSendingEmail(false);
    if(user) {
        setBuyerName(user.displayName);
        setBuyerContact(user.email);
    }
  };

  // --- THE EMAIL SENDING LOGIC ---
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if(!buyerName || !buyerContact) return alert("Please fill in your details!");
    
    setSendingEmail(true); // Start loading

    // These names must match your EmailJS Template variables exactly!
    const templateParams = {
        seller_email: selectedItem.sellerEmail, 
        item_title: selectedItem.title,
        item_price: selectedItem.price,
        buyer_name: buyerName,
        buyer_contact: buyerContact,
        message: buyerMessage
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
         console.log('SUCCESS!', response.status, response.text);
         setSendingEmail(false);
         setOrderSuccess(true); // Show success screen
      }, (err) => {
         console.log('FAILED...', err);
         setSendingEmail(false);
         alert("Failed to send email. (Did you paste your keys correctly?)");
      });
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", itemId));
        setProducts(products.filter(item => item.id !== itemId));
      } catch (error) { alert("Error deleting: " + error.message); }
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nextImage = () => { if (selectedItem?.images) setCurrentImageIndex((prev) => (prev === selectedItem.images.length - 1 ? 0 : prev + 1)); };
  const prevImage = () => { if (selectedItem?.images) setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.images.length - 1 : prev - 1)); };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-void transition-colors duration-500">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-void border-b border-slate-100 dark:border-slate-800 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            Find <span className="text-violet-600 dark:text-neon">Anything.</span>
          </h1>
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors"><Search size={24} /></div>
            <input type="text" placeholder="Search for items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-full border-2 border-transparent focus:border-violet-500 dark:focus:border-neon focus:bg-white dark:focus:bg-black text-lg outline-none transition-all shadow-sm font-medium text-slate-900 dark:text-white" />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${selectedCategory === cat ? "bg-slate-900 dark:bg-neon text-white dark:text-black scale-105 shadow-lg" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-500"}`}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8 text-slate-400 text-sm font-bold uppercase tracking-wider"><Filter size={16}/> Showing {filteredProducts.length} Results</div>
        {loading ? <p className="text-center text-slate-400">Loading...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => (
              <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:-translate-y-2">
                {user && item.sellerId === user.uid && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="absolute top-6 right-6 z-20 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all"><Trash2 size={16} /></button>
                )}
                <div className="relative bg-white dark:bg-slate-900 rounded-[22px] p-4 h-full flex flex-col">
                  <div className="h-56 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 relative overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={48} /></div>}
                    {item.category && <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{item.category}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <div className="mt-auto flex justify-between items-center">
                    <p className="text-2xl font-black text-slate-900 dark:text-neon">₹{item.price}</p>
                    <button onClick={() => openModal(item)} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2 rounded-xl font-bold hover:bg-violet-600 hover:text-white dark:hover:bg-neon dark:hover:text-black transition-colors">Buy</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* MODAL (POPUP) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-0 rounded-3xl max-w-lg w-full relative border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 z-50 p-2 bg-white/50 dark:bg-black/50 rounded-full"><X size={24} /></button>

            {/* VIEW 1: DETAILS */}
            {!isCheckout && (
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="relative w-full h-72 bg-slate-100 dark:bg-black/50 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedItem.images && selectedItem.images.length > 0 ? (
                      <>
                        <img src={selectedItem.images[currentImageIndex]} className="w-full h-full object-cover" alt="Product" />
                        {selectedItem.images.length > 1 && (
                          <>
                            <button onClick={prevImage} className="absolute left-2 bg-black/50 text-white p-2 rounded-full hover:bg-violet-600"><ChevronLeft size={24}/></button>
                            <button onClick={nextImage} className="absolute right-2 bg-black/50 text-white p-2 rounded-full hover:bg-violet-600"><ChevronRight size={24}/></button>
                            <div className="absolute bottom-4 flex gap-1">
                              {selectedItem.images.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}></div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (<ShoppingBag size={64} className="text-slate-400"/>)}
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{selectedItem.title}</h3>
                    <p className="text-3xl font-black text-violet-600 dark:text-neon">₹{selectedItem.price}</p>
                  </div>
                  <span className="inline-block bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">{selectedItem.category || "General"}</span>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase opacity-70">Description & Condition</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedItem.description || "No specific details provided."}</p>
                  </div>
                  <button onClick={() => setIsCheckout(true)} className="w-full bg-slate-900 dark:bg-neon text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl flex justify-center items-center gap-2">
                     Message Seller / Buy <ChevronRight size={20}/>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: CHECKOUT FORM */}
            {isCheckout && !orderSuccess && (
              <div className="p-8 h-full overflow-y-auto">
                <button onClick={() => setIsCheckout(false)} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold mb-6 text-sm"><ChevronLeft size={16}/> Back to Item</button>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Contact Seller</h2>
                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700">
                   <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                      {selectedItem.images && selectedItem.images[0] && <img src={selectedItem.images[0]} className="w-full h-full object-cover"/>}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedItem.title}</p>
                      <p className="text-violet-600 dark:text-neon font-bold">₹{selectedItem.price}</p>
                   </div>
                </div>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label><input required className="w-full bg-slate-100 dark:bg-black/30 border border-transparent focus:border-violet-500 p-3 rounded-xl dark:text-white font-bold outline-none" value={buyerName} onChange={e => setBuyerName(e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Info (Phone/Email)</label><input required className="w-full bg-slate-100 dark:bg-black/30 border border-transparent focus:border-violet-500 p-3 rounded-xl dark:text-white font-bold outline-none" value={buyerContact} onChange={e => setBuyerContact(e.target.value)} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message to Seller</label><div className="relative"><MessageCircle className="absolute top-3 left-3 text-slate-400" size={18}/><textarea className="w-full bg-slate-100 dark:bg-black/30 border border-transparent focus:border-violet-500 p-3 pl-10 rounded-xl dark:text-white font-medium outline-none h-20 resize-none" placeholder="Hi, is this still available?" value={buyerMessage} onChange={e => setBuyerMessage(e.target.value)}></textarea></div></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Payment</label><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setPaymentMethod('cash')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-neon' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><MapPin size={24}/><span className="text-xs font-bold">Cash on Meet</span></button><button type="button" onClick={() => setPaymentMethod('upi')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'upi' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-neon' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><CreditCard size={24}/><span className="text-xs font-bold">UPI / Online</span></button></div></div>
                  
                  {/* SEND BUTTON WITH LOADING STATE */}
                  <button disabled={sendingEmail} className="w-full mt-4 bg-slate-900 dark:bg-neon text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {sendingEmail ? "Sending Email..." : "Send Request"}
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 3: SUCCESS */}
            {orderSuccess && (
              <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle size={40}/></div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Request Sent!</h2>
                 <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">The seller has been notified via email. They will contact you shortly.</p>
                 <button onClick={() => setSelectedItem(null)} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">Back to Browsing</button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// --- SELL PAGE (LISTING ITEMS) ---
const SellPage = ({ user }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Books');
  const [link1, setLink1] = useState('');
  const [link2, setLink2] = useState('');
  const [link3, setLink3] = useState('');

  const categories = ["Books", "Electronics", "Furniture", "Clothing", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !link1) return alert("Fill in the basics!");
    const images = [link1, link2, link3].filter(link => link.length > 0);
    try {
      await addDoc(collection(db, "products"), { 
          title, 
          price: parseFloat(price), 
          description, 
          category, 
          images, 
          sellerId: user.uid, 
          sellerEmail: user.email, // SAVING EMAIL FOR EMAILJS
          createdAt: new Date() 
      });
      alert("Success!");
      window.location.href = "/";
    } catch (error) { alert("Error listing item."); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-void pt-32 px-6 transition-colors duration-500">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-[30px] shadow-xl border border-slate-100 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">List an Item</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Item Name</label><input className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Price (₹)</label><input className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label><div className="flex flex-wrap gap-2">{categories.map(cat => (<button type="button" key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all ${category === cat ? "bg-violet-600 text-white border-violet-600" : "bg-slate-50 dark:bg-black/30 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-violet-500"}`}>{cat}</button>))}</div></div>
          <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Images</label><input className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white" placeholder="Main Link..." value={link1} onChange={(e) => setLink1(e.target.value)} /><div className="flex gap-2"><input className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white" placeholder="Angle 2..." value={link2} onChange={(e) => setLink2(e.target.value)} /><input className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white" placeholder="Angle 3..." value={link3} onChange={(e) => setLink3(e.target.value)} /></div></div>
          <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label><textarea className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-700 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white h-24" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <button className="w-full bg-slate-900 dark:bg-neon text-white dark:text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform">Publish Listing</button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u)); return () => unsubscribe(); }, []);
  return <div className={darkMode ? "dark" : ""}><div className="font-sans antialiased text-slate-900 dark:text-white min-h-screen bg-slate-50 dark:bg-void transition-colors duration-500"><Navbar user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} /><Routes><Route path="/" element={<HomePage user={user} />} /><Route path="/sell" element={<SellPage user={user} />} /></Routes></div></div>;
}