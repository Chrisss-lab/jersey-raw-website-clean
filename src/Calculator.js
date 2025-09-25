import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Calculator() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [totalFood, setTotalFood] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/recipes")
      .then(res => res.json())
      .then(data => setRecipes(data))
      .catch(console.error);
  }, []);

  const handleOrder = async () => {
    if (!selectedRecipe) return alert("Select a recipe");
    if (!totalFood) return alert("Enter amount");

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name,
        recipe: selectedRecipe,
        pounds: totalFood,
        email: "",
        address: "",
        packaging: "",
        coupon: "",
        total: totalFood
      })
    });

    if (res.ok) alert("Order sent!");
    else alert("Error sending order");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Dog Food Calculator</h2>
      <div>
        <label>Name:</label>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label>Phone:</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div>
        <label>Recipe:</label>
        <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)}>
          <option value="">--Select--</option>
          {recipes.map((r, i) => <option key={i} value={r.Name}>{r.Name}</option>)}
        </select>
      </div>
      <div>
        <label>Total Food (lbs):</label>
        <input value={totalFood} onChange={e => setTotalFood(e.target.value)} />
      </div>
      <button onClick={handleOrder}>Order Now</button>
    </div>
  );
}
