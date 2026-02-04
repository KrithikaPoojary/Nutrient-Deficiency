import { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    lifestyle: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    alert("User Registered Successfully");
  };

  return (
    <div>
      <h2>Register User</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="age" placeholder="Age" onChange={handleChange} />
      <input name="gender" placeholder="Gender" onChange={handleChange} />
      <input name="lifestyle" placeholder="Lifestyle" onChange={handleChange} />

      <button onClick={submit}>Register</button>
    </div>
  );
}

export default Register;
