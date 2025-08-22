

# 📈 StockSwift – Stock Market Simulator

A full-stack **stock trading simulator** where users can trade virtual stocks, track live prices, and analyze performance. Built with **React (Vite, Tailwind, Recharts, ShadCN UI)** on the frontend and **Spring Boot + MySQL (JWT Secured)** on the backend.

🔗 **Live Demo**: [StockSwift](https://stockswift.netlify.app/)
🔗 **Backend API**: [Render Deployment](https://stocksimulator-backend.onrender.com/)

---

## 🚀 Features

### 👤 User Features

* 🔑 **JWT Authentication** – Signup & login with token-based security
* 📊 **Portfolio Management** – Buy, sell & add stocks to your portfolio
* ⭐ **Watchlist** – Track favorite stocks with **live updates**
* 📈 **Real-Time Stock Data** – Powered by **[Twelve Data API](https://twelvedata.com/)**
* 📊 **Interactive Stock Charts** – Line, Candlestick, Area & Bar charts
* 📝 **Transaction History** – Search, filter, sort & **export as PDF/Print**
* 💹 **Real-Time Prices** – Sparkline charts & moving averages

### 🛠️ Admin Features

* 👥 **User Management** – View, delete, or change roles of users
* 📊 **Trade Analytics Dashboard**

  * **Active Traders Leaderboard** (chart & table view)
  * **Recent Trades Timeline**
  * **Top Stocks by Trade Volume**
  * **Executed Trades Overview**

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), TailwindCSS, ShadCN UI, Recharts, Axios, Framer Motion
* **Backend**: Spring Boot, Spring Security (JWT), JPA/Hibernate, MySQL
* **Database**: MySQL (Dockerized)
* **External APIs**:

  * 🔗 [Twelve Data API](https://twelvedata.com/) → Live stock prices & time-series data
* **Other Tools**:

  * `html2canvas` + `jsPDF` → Transaction history PDF export
  * `Recharts` → Charts & Analytics
  * `Framer Motion` → Smooth UI animations


