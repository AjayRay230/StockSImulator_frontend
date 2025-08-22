import { useEffect, useState } from "react";
import { useUser } from "../context/userContext";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";

import { FaFileDownload,FaPrint } from "react-icons/fa";
const TransactionHistory = () => {
const{user} = useUser();
const userId = user?.userId;
  const [transaction, setTransaction] = useState([]);
  const[filterType ,setFilterType] = useState("ALL");
  const[searchQuery,setSearchQuery] = useState("");
  const[sort,setSortKey] = useState("timestamp");
  const PrintRef = React.useRef(null);
  const filter = transaction
                .filter((txn)=>filterType==="ALL" ?true:txn.type===filterType )
                .filter((txn)=>txn.stocksymbol.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a,b)=>{
                  if(sort==="timestamp") return new Date(b.timestamp)-new Date(a.timestamp);
                  if(sort==="price") return b.currentPrice-a.currentPrice;
                  if(sort==="total")  return b.totalAmount-a.totalAmount;
                  return 0;
                });


  useEffect(() => {
    const fetchResponse = async () => {
      if (userId) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `https://stocksimulator-backend.onrender.com/api/transaction/history/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          setTransaction(response.data);
        } catch (err) {
          console.error("Failed to get the Transaction History", err);
        }
      }
    };

    fetchResponse();
  }, [userId]);




  const handleDownloadPdf = async () => {
  const element = PrintRef.current;
  if (!element) return;

  const canvas = await html2canvas(PrintRef.current, {
    scale: 5,
    useCORS:true,//in case image /fonts are loaded 
    backgroundColor:null,
  });

  const data = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "a4",
  });

  const imageProperties = pdf.getImageProperties(data);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imageProperties.height * pdfWidth) / imageProperties.width;

  pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("transaction-history.pdf");
};

 
  return (
    <>
    <div className="transactionHistory-container">
      
      <div className="controls">
        {/* <div className=" search-wrapper"> */}
        <input type = "text"
        value = {searchQuery}
        placeholder="Search..."
        onChange={(e)=>setSearchQuery(e.target.value)}/>
        
        <div className="filter-buttons">
          <button className={filterType==="ALL"?"active":""}
          onClick={()=>setFilterType("ALL")}>
            ALL
          </button>
            <button className={filterType==="BUY"?"active":""}
          onClick={()=>setFilterType("BUY")}>
            BUY
          </button>
            <button className={filterType==="SELL"?"active":""}
          onClick={()=>setFilterType("SELL")}>
            SELL
          </button>
          <select value = {sort} onChange={(e)=>setSortKey(e.target.value)}>
            <option value = "price"> sort by Price</option>
            <option value = "timestamp">sort by Time</option>
            <option value = "total">sort by Total Amount</option>
          </select>
        </div>
      </div>
      {filter.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div ref={PrintRef}>
          <h2 style={{textAlign:"center",margin:"40px"}}>Transaction History</h2>
        <div   className="table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filter.map((txn, index) => (
              <tr key={index} className="fade-in-table-body">
                <td>{txn.stocksymbol}</td>
                <td>
                 <span className={`badge ${txn.type === "BUY" ? "buy" : "sell"}`}>
                  {txn.type}</span>
                  </td>
                <td>{txn.quantity}</td>
                <td>{txn.currentprice.toFixed(2)}</td>
                <td>{txn.totalAmount.toFixed(2)}</td>
                <td>{new Date(txn.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>
      )}
    </div>
    <div className="pdf-btn-container">
      <button onClick={handleDownloadPdf} className="download-pdf-btn">
            <FaFileDownload/>  Download PDF
      </button>
      <button onClick={()=>window.print()} className="print-btn"><FaPrint/>Print Table</button>
    </div>
    </>
  );
};

export default TransactionHistory;
