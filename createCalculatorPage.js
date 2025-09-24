const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "Calculator.js");

const componentContent = `import React, { useState } from "react";

function Calculator() {
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("medium");
  const [dailyFood, setDailyFood] = useState(null);

  const calculateFood = () => {
    if (!weight) return;
    let factor = activity === "low" ? 0.02 : activity === "high" ? 0.04 : 0.03;
    setDailyFood((weight * factor).toFixed(2));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#2b6e44", textAlign: "center", marginBottom: "25px" }}>Food Calculator</h2>
      <label>
        Dog Weight (lbs):
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }} />
      </label>
      <label>
        Activity Level:
        <select value={activity} onChange={e => setActivity(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <button onClick={calculateFood} style={{ padding: "12px", backgroundColor: "#2b6e44", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Calculate</button>
      {dailyFood !== null && <p style={{ marginTop: "15px", fontWeight: "bold" }}>Daily Food: {dailyFood} lbs</p>}
    </div>
  );
}

export default Calculator;
`;

fs.writeFileSync(filePath, componentContent, "utf8");

console.log("✅ Calculator.js created successfully in src folder!");
