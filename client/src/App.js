import {useEffect, useState} from "react";
import './App.css';
import { Chart } from "react-google-charts";
const monthMap = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};
const options = {
  title: "price",
  width: 600,
  height: 400,
  bar: { groupWidth: "75%" },
  legend: { position: "none" },
};
function App() {
  const [transaction,setTransaction]=useState([]);
  const [stats,setStats]=useState([]);
  const [month,setMonth] = useState("03");
  const [page,setPage]=useState(1)
  const [search,setSeacrh]=useState("");
  const [chartD,setChartD]=useState([]);
  const barChartData=async()=>{
    const response = await fetch(`http://localhost:3000/barchart?keyword=${month}`);
    const data1=await response.json();
    const data=data1.obj;
    var chartData = [
      [
        "Price",
        "Units",
        { role: "style" },
        {
          sourceColumn: 0,
          role: "annotation",
          type: "string",
          calc: "stringify",
        },
      ],
    ]
    data.map((abc)=>{
      chartData.push([`${abc.key-100} - `+abc.key,abc.value,"gold",null])
    })
    setChartD(chartData);
  }
  const fetchTransaction=async()=>{
    const response = await fetch(`http://localhost:3000/transactions?page=${page}&perPage=10&search=${search}`);
    const data=await response.json();
    console.log(data);
    setTransaction(data);
  }
  const fetchStats=async()=>{
    const response = await fetch(`http://localhost:3000/salesmonth?keyword=${month}`);
    const data=await response.json();
    console.log(data);
    setStats(data);
  }
  const handlePrevPage=()=>{
    if(page>1)
    {
      setPage(page-1);
      
    }
  }
  const handleNextPage=()=>{
    setPage(page+1);
  }
  const handleSearch=(e)=>{
    setSeacrh(e.target.value);
  }
  useEffect(()=>{
    fetchTransaction();
    fetchStats();
    barChartData();
  },[month,page,search])
  return (
    <div>
      <div className="searchBox">
        <input type="text" onChange={handleSearch} placeholder="Search according to title or description"/>
      </div>
      <div className="drpdwn">
        <select onChange={(e)=>{setMonth(e.target.value)}}>
          <option value="01">Jan</option>
          <option value="02">Feb</option>
          <option value="03" selected="true">March</option>
          <option value="04">Apr</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">Aug</option>
          <option value="09">Sep</option>
          <option value="10">Oct</option>
          <option value="11">Nov</option>
          <option value="12">Dec</option>
        </select>
      </div>
      <table>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Price</th>
          <th>Category</th>
          <th>Sold</th>
          <th>Image</th>
        </tr>
        {transaction.map((trans)=>{
          return(<tr>
            <th>{trans.id}</th>
            <th>{trans.title}</th>
            <th>{trans.description}</th>
            <th>{trans.price}</th>
            <th>{trans.category}</th>
            <th>{trans.sold?"true":"false"}</th>
            <th><img src={trans.image} width="100px" height="100px"/></th>
          </tr>);
        })}
      </table>
      <div className="tablebtn">
        <p style={{color:"white"}}>Page no - {page}</p>
        <button onClick={handlePrevPage}>Previous</button>
        <button onClick={handleNextPage} style={{right:"180px"}}>Next</button>
        <p style={{color:"white"}}>Per Page - 10</p>
      </div>
      <hr/>
      <div className="stats">
        <h1>Statistics - {monthMap[month]}</h1>
        <div>
          <p>Total Sale - {stats.totalSales}</p>
          <p>Total Sold Item - {stats.totalSoldItems}</p>
          <p>Total Not Sold Item - {stats.totalNotSoldItems}</p>
        </div>
      </div>
      <hr/>
      <div className="chart">
        <Chart
        chartType="BarChart"
        width="100%"
        height="400px"
        data={chartD}
        options={options}
      />
      </div>
    </div>
  );
}

export default App;
