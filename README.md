# 🛒 UniMarket - Campus Marketplace

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![React](https://img.shields.io/badge/React-18.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-9.0-orange) ![Vite](https://img.shields.io/badge/Vite-4.0-purple)

**UniMarket** is a full-stack, peer-to-peer marketplace designed for college students to buy and sell used goods (textbooks, electronics, furniture) within their campus community. It features secure authentication, real-time database updates, and an automated email inquiry system.

🔗 **Live Demo:** [https://unimarket-by-tejas.vercel.app](https://unimarket-by-tejas.vercel.app)

---

## 🚀 Key Features

* **🔐 Secure Authentication:** Google Sign-In integration via Firebase Auth.
* **📦 Smart Listings:** Sellers can upload multiple images (up to 3 angles) and categorize items.
* **🔍 Search & Filter:** Real-time search bar and category filters (Books, Electronics, etc.) for instant discovery.
* **📧 Automated Inquiries:** "Contact Seller" button auto-generates emails to the seller using **EmailJS** (no backend server required).
* **🛡️ Ownership Verification:** Delete buttons only appear on items *you* listed.
* **🎨 Responsive Design:** Fully responsive UI with **Dark Mode** support, built with Tailwind CSS.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide React (Icons)
* **Backend (Serverless):** Google Firebase (Authentication & Firestore NoSQL Database)
* **Integrations:** EmailJS (Transactional Emails)
* **Deployment:** Vercel

---

## 📸 Screenshots

*(You can add screenshots of your app here later!)*

---

## 💻 Installation & Setup

If you want to run this project locally on your machine, follow these steps:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/tejaskm2005/unimarket.git](https://github.com/tejaskm2005/unimarket.git)
    cd unimarket
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Keys**
    * Create a `firebase.js` file in `src/` and add your Firebase Config keys.
    * Update `App.jsx` with your **EmailJS** Service ID, Template ID, and Public Key.

4.  **Run the App**
    ```bash
    npm run dev
    ```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes.
4.  Push to the branch and open a Pull Request.

---

**Developed by Tejas K.M.**