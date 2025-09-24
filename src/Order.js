import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Order() {
  const location = useLocation();
  const prefill = location.state || {};

  const [recipes, setRecipes] = useState([]);
  const [packagingOptions, setPackagingOptions] = useState([]);
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    address: "",
    recipe: prefill.recipe || "",
    pounds: prefill.totalFood ? Math.ceil(prefill.totalFood) : 1,
    packaging: "",
    coupon: "",
  });
  const [errors, setErrors] = useState({});
  const [totalPrice, setTotalPrice] = useState({
    subtotal: "0.00",
    discount: "0.00",
    tax: "0.00",
    final: "0.00",
  });
  const [packageError, setPackageError] = useState("");

  const TAX_RATE = 0.06625; // NJ sales tax

  useEffect(() => {
    fetch("http://localhost:5000/api/recipes")
      .then((res) => res.json())
      .then(setRecipes)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/packages")
      .then((res) => res.json())
      .then((data) => {
        setPackagingOptions(data);
        setForm((prev) => ({
          ...prev,
          packaging: prev.packaging || (data[0]?.Type || ""),
        }));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const selectedRecipe = recipes.find((r) => r.Name === form.recipe);
    const selectedPackage = packagingOptions.find(
      (p) => p.Type === form.packaging
    );

    if (selectedRecipe) {
      const price = parseFloat(selectedRecipe.Price) || 0;
      const discountPct = selectedPackage
        ? parseFloat(selectedPackage.Discount.replace("%", "")) || 0
        : 0;

      const subtotal = price * form.pounds;
      const discount = subtotal * (discountPct / 100);
      const tax = (subtotal - discount) * TAX_RATE;
      const total = subtotal - discount + tax;

      setTotalPrice({
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        final: total.toFixed(2),
      });

      if (selectedPackage) {
        const containerSize = parseFloat(selectedPackage.Size);
        if (containerSize && form.pounds % containerSize !== 0) {
          setPackageError(
            `Please choose an amount of food divisible by ${containerSize} lb per container.`
          );
        } else {
          setPackageError("");
        }
      }
    } else {
      setTotalPrice({
        subtotal: "0.00",
        discount: "0.00",
        tax: "0.00",
        final: "0.00",
      });
    }
  }, [form, recipes, packagingOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d*$/.test(value)) setForm((prev) => ({ ...prev, phone: value }));
      return;
    }

    if (name === "pounds") {
      const intVal = Math.floor(parseFloat(value) || 0);
      setForm((prev) => ({ ...prev, pounds: intVal }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!form.phone) newErrors.phone = "Phone number is required";
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.recipe) newErrors.recipe = "Please select a recipe";
    if (!form.pounds) newErrors.pounds = "Please enter the number of pounds";
    if (!form.packaging) newErrors.packaging = "Please select a package";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !packageError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      const selectedPackage = packagingOptions.find(
        (p) => p.Type === form.packaging
      );
      const packageLabel = selectedPackage
        ? `${selectedPackage.Type} - ${parseFloat(selectedPackage.Size)} lb per container`
        : form.packaging;

      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtotal: totalPrice.subtotal,
          discount: totalPrice.discount,
          tax: totalPrice.tax,
          total: totalPrice.final,
          packaging: packageLabel,
        }),
      });

      if (res.ok) {
        alert(`Order submitted!\nTotal: $${totalPrice.final}`);
        setForm({
          phone: "",
          name: "",
          email: "",
          address: "",
          recipe: "",
          pounds: 1,
          packaging: packagingOptions[0]?.Type || "",
          coupon: "",
        });
        setTotalPrice({
          subtotal: "0.00",
          discount: "0.00",
          tax: "0.00",
          final: "0.00",
        });
        setErrors({});
        setPackageError("");
      } else {
        alert("Error submitting order");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting order");
    }
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1em",
    width: "100%",
  };
  const selectStyle = { ...inputStyle, backgroundColor: "#fff" };
  const buttonStyle = {
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2b6e44",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1.1em",
    cursor: "pointer",
  };
  const errorStyle = { color: "red", fontSize: "0.85em", marginTop: "3px" };

  return (
    <section
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#2b6e44",
          textAlign: "left",
          marginBottom: "25px",
        }}
      >
        Place Your Order – Fresh Raw Dog Food in Morris County, NJ
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "18px" }}
      >
        <label>
          Phone Number:
          <input
            id="phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        {errors.phone && <div style={errorStyle}>{errors.phone}</div>}

        <label>
          Full Name:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        {errors.name && <div style={errorStyle}>{errors.name}</div>}

        <label>
          Email Address:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        {errors.email && <div style={errorStyle}>{errors.email}</div>}

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        {errors.address && <div style={errorStyle}>{errors.address}</div>}

        <label>
          Select Recipe:
          <select
            name="recipe"
            value={form.recipe}
            onChange={handleChange}
            style={selectStyle}
            required
          >
            <option value="">Select Recipe</option>
            {recipes.map((r, idx) => (
              <option key={idx} value={r.Name}>
                {r.Name}
              </option>
            ))}
          </select>
        </label>
        {errors.recipe && <div style={errorStyle}>{errors.recipe}</div>}

        <label>
          Number of Pounds:
          <div style={{ position: "relative" }}>
            <input
              type="number"
              name="pounds"
              min="1"
              step="1"
              value={form.pounds}
              onChange={handleChange}
              style={{ ...inputStyle, paddingRight: "40px" }}
              required
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#555",
                fontWeight: "bold",
              }}
            >
              lb
            </span>
          </div>
        </label>
        {errors.pounds && <div style={errorStyle}>{errors.pounds}</div>}
        {packageError && <div style={errorStyle}>{packageError}</div>}

        <label>
          Packaging:
          <select
            name="packaging"
            value={form.packaging}
            onChange={handleChange}
            style={selectStyle}
            required
          >
            {packagingOptions.length === 0 ? (
              <option value="">Loading packages...</option>
            ) : (
              packagingOptions.map((p, idx) => (
                <option key={idx} value={p.Type}>
                  {p.Type} - {parseFloat(p.Size)} lb per container
                </option>
              ))
            )}
          </select>
        </label>
        {errors.packaging && <div style={errorStyle}>{errors.packaging}</div>}

        <label>
          Coupon Code (Optional):
          <input
            type="text"
            name="coupon"
            value={form.coupon}
            onChange={handleChange}
            style={inputStyle}
          />
        </label>

        <div
          style={{
            backgroundColor: "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "1em",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#2b6e44", textAlign: "left" }}>
            Order Summary
          </h3>
          <p>Subtotal: ${totalPrice.subtotal}</p>
          <p>Discount: -${totalPrice.discount}</p>
          <p>Tax: ${totalPrice.tax}</p>
          <hr />
          <p style={{ fontWeight: "bold", fontSize: "1.2em" }}>
            Total: ${totalPrice.final}
          </p>
        </div>

        <button type="submit" style={buttonStyle}>
          Submit Order
        </button>
      </form>
    </section>
  );
}

export default Order;
