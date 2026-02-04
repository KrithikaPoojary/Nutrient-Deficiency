import { useState } from "react";

function FoodLog() {
  const [food, setFood] = useState({
    user_id: "",
    food_name: "",
    quantity: "",
    date: ""
  });

  const handleChange = (e) => {
    setFood({ ...food, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    await fetch("http://127.0.0.1:5000/food-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(food)
    });

    alert("Food Logged");
  };

  return (
    <div>
      <h2>Food Intake</h2>

      <input name="user_id" placeholder="User ID" onChange={handleChange} />
      <input name="food_name" placeholder="Food Name" onChange={handleChange} />
      <input name="quantity" placeholder="Quantity" onChange={handleChange} />
      <input name="date" placeholder="Date" onChange={handleChange} />

      <button onClick={submit}>Add Food</button>
    </div>
  );
}

export default FoodLog;
