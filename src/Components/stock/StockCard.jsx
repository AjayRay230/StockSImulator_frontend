import LivePrice from "./LivePrice";

const StockCard =({stock})=>{
    console.log("Rendering stockcard for :"  ,stock.symbol);
    return(
    <div className="stockcard-container">
        <h3>{stock.symbol}-{stock.companyname}</h3>
        <p> Initial Price :{stock.currentprice}</p>
        <p>Changes:{stock.changepercent}</p>
        <p>Last Updated :{new Date(stock.lastupdate).toLocaleDateString()}</p>
        <div style={{ marginTop: '10px', backgroundColor: '#111', padding: '10px', borderRadius: '8px' }}>
        <LivePrice symbol={stock.symbol} />

      </div>
    </div>
    )
}
export default StockCard;