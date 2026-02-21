import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import emailjs from "@emailjs/browser";
import { trackClick } from "../utils/analytics";

export default function BookingWidget({ restaurant }) {
 const { user, requestLoginOTP, verifyLoginOTP } = useAuth();
 const navigate = useNavigate();

 const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0],
 );
 const [partySize, setPartySize] = useState(2);
 const [time, setTime] = useState("");

 // Flow States: 'select' -> 'guest_email' -> 'guest_otp' -> 'success'
 const [view, setView] = useState("select");

 const [guestEmail, setGuestEmail] = useState("");
 const [guestOtp, setGuestOtp] = useState("");

 const [loading, setLoading] = useState(false);
 const [message, setMessage] = useState("");
 const [bookingCode, setBookingCode] = useState("");

 // Mock available slots - ideally this comes from restaurant open/close times
 const baseSlots = ["17:00", "17:15", "17:30", "19:00", "19:15", "20:30"];
 const [bookedSlots, setBookedSlots] = useState([]);

 useEffect(() => {
  if (restaurant && restaurant.id) {
   fetchBookedSlots();
  }
 }, [selectedDate, restaurant]);

 const fetchBookedSlots = async () => {
  // If restaurant ID is not a UUID (i.e. static data '1', '2'), skip DB fetch
  if (!restaurant || !restaurant.id || restaurant.id.toString().length < 20)
   return;

  try {
   const { data, error } = await supabase
    .from("bookings")
    .select("time")
    .eq("restaurant_id", restaurant.id)
    .eq("date", selectedDate)
    .neq("status", "cancelled")
    .neq("status", "completed");

   if (error) throw error;

   if (data) {
    setBookedSlots(data.map((b) => b.time));
   }
  } catch (error) {
   console.error("Error fetching slots:", error);
  }
 };

 const generateBookingCode = () => {
  const prefix = "RES";
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase();
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `${prefix}-${datePart}-${randomPart}`;
 };

 const sendReceiptEmail = async (bookingDetails, email) => {
  // NOTE: Use your existing EmailJS Service and Public Key.
  // You MUST create a NEW Template in EmailJS for this receipt.
  // The template should expect variables: to_name, booking_code, date, time, party_size, restaurant_name, restaurant_location

  const serviceID = "service_wcykj6j"; // Reuse existing service
  const templateID = "template_w7xe8vj"; // User provided template
  const publicKey = "3cenvoR92dSsx7chn"; // Reuse existing key

  try {
   const templateParams = {
    email: email, // Changed from to_email to match EmailJS Dashboard {{email}}
    to_name: email.split("@")[0],
    booking_code: bookingDetails.booking_code,
    date: bookingDetails.date,
    time: bookingDetails.time,
    party_size: bookingDetails.party_size,
    restaurant_name: bookingDetails.restaurant_name,
    restaurant_location: restaurant.location || "",
   };

   await emailjs.send(serviceID, templateID, templateParams, publicKey);
   console.log("Receipt email sent successfully!");
  } catch (error) {
   console.error("Failed to send receipt email:", error);
   // We don't block the UI success state if email fails
  }
 };

 const executeBooking = async (userId, userEmail = null) => {
  // If userEmail is not provided, try to get it from current session or guest email
  let emailToSendTo = userEmail || guestEmail;

  // If logged in via AuthContext and no guestEmail, get from user object if available
  if (!emailToSendTo && user && user.email) {
   emailToSendTo = user.email;
  }

  const newBookingCode = generateBookingCode();

  // Check if this is a static restaurant (numeric ID or short ID)
  const isStaticRestaurant =
   !restaurant.id || restaurant.id.toString().length < 20;

  try {
   const bookingData = {
    user_id: userId, // For static, we might not have a real user_id if guest, but we'll ignore for simulate
    restaurant_id: restaurant.id,
    restaurant_name: restaurant.name,
    date: selectedDate,
    time: time,
    party_size: partySize,
    booking_code: newBookingCode,
   };

   if (!isStaticRestaurant) {
    // Real DB Booking
    const { error } = await supabase.from("bookings").insert([bookingData]);

    if (error) throw error;
   } else {
    // Simulate network delay for static demo
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Simulated booking for static restaurant:", bookingData);
   }

   setBookingCode(newBookingCode);

   // Track booking click
   trackClick(restaurant.id, "booking");

   // Add the booked time to the bookedSlots array to prevent double-booking
   setBookedSlots((prev) => [...prev, time]);

   // Send Email (We can still send email for static bookings if configured!)
   if (emailToSendTo) {
    await sendReceiptEmail(bookingData, emailToSendTo);
   }

   setView("success");
  } catch (error) {
   console.error("Booking Error:", error);
   alert(`Booking failed: ${error.message}.`);
   setView("select");
  } finally {
   setLoading(false);
  }
 };

 const handleInitialClick = async () => {
  if (!time) {
   alert("Please select a time.");
   return;
  }

  if (user) {
   setLoading(true);
   await executeBooking(user.id, user.email);
  } else {
   // Not logged in -> Guest Flow
   setView("guest_email");
  }
 };

 const handleGuestEmailSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  const result = await requestLoginOTP(guestEmail);
  setLoading(false);

  if (result.success) {
   setView("guest_otp");
  } else {
   setMessage(result.message);
  }
 };

 const handleGuestOtpSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  const result = await verifyLoginOTP(guestEmail, guestOtp);

  if (result.success) {
   // User is now logged in context, but we need the ID from the result ideally,
   // or we might need to wait for context to update.
   // Better: fetch user id via the email we just verified to be safe/fast
   // or rely on the auth context updating mechanism.
   // Let's refetch user ID to be 100% sure for the booking.
   const { data: users, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", guestEmail)
    .single();
   if (userError) throw userError;

   if (users) {
    await executeBooking(users.id, guestEmail);
   } else {
    setLoading(false);
    alert("Error finding your account after verification.");
   }
  } else {
   setLoading(false);
   setMessage(result.message);
  }
 };

 if (view === "success") {
  return (
   <div
    className="glass"
    style={{
     padding: "2rem",
     borderRadius: "18px",
     textAlign: "center",
     boxShadow: "var(--shadow-lg)",
     position: "sticky",
     top: "100px",
    }}>
    <div
     style={{
      background: "rgba(34, 197, 94, 0.1)",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 1rem auto",
     }}>
     <span style={{ fontSize: "1.5rem" }}>🎉</span>
    </div>
    <h3 style={{ margin: "0 0 0.5rem 0" }}>Booking Confirmed!</h3>
    {bookingCode && (
     <div
      style={{
       background: "rgba(255,255,255,0.1)",
       padding: "0.5rem 1rem",
       borderRadius: "8px",
       margin: "1rem 0",
       display: "inline-block",
      }}>
      <span
       style={{
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        display: "block",
       }}>
       Booking Reference
      </span>
      <code
       style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "1px" }}>
       {bookingCode}
      </code>
     </div>
    )}
    <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
     You are booked at <strong>{restaurant.name}</strong>
     <br />
     for {partySize} people on {selectedDate} at {time}.
    </p>
    <div
     style={{
      padding: "1rem",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "8px",
      marginBottom: "1.5rem",
     }}>
     <p style={{ fontSize: "0.9rem", color: "#10b981", margin: 0 }}>
      A receipt with details has been sent to your email.
     </p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
     <button
      className="btn btn-secondary"
      onClick={() => {
       setView("select");
       // Re-fetch booked slots to show updated availability
       if (
        restaurant &&
        restaurant.id &&
        restaurant.id.toString().length >= 20
       ) {
        fetchBookedSlots();
       }
      }}>
      Make Another Booking
     </button>
     <button className="btn btn-primary" onClick={() => navigate("/")}>
      Back to Home
     </button>
    </div>
   </div>
  );
 }

 if (view === "guest_email") {
  return (
   <div
    className="glass"
    style={{
     padding: "2rem",
     borderRadius: "18px",
     position: "sticky",
     top: "100px",
    }}>
    <h3 style={{ textAlign: "center", margin: "0 0 1rem 0" }}>One Last Step</h3>
    <p
     style={{
      fontSize: "0.9rem",
      color: "var(--text-muted)",
      marginBottom: "1.5rem",
      textAlign: "center",
     }}>
     Enter your email to confirm this booking. We'll send you a code.
    </p>
    <form onSubmit={handleGuestEmailSubmit}>
     <input
      type="email"
      required
      placeholder="name@example.com"
      value={guestEmail}
      onChange={(e) => setGuestEmail(e.target.value)}
      style={{ width: "100%", marginBottom: "1rem" }}
      autoFocus
     />
     {message && (
      <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem" }}>
       {message}
      </p>
     )}
     <div style={{ display: "flex", gap: "0.5rem" }}>
      <button
       type="button"
       className="btn btn-secondary"
       onClick={() => setView("select")}
       style={{ flex: 1 }}>
       Back
      </button>
      <button
       type="submit"
       className="btn btn-primary"
       disabled={loading}
       style={{ flex: 2 }}>
       {loading ? "Sending..." : "Send Code"}
      </button>
     </div>
    </form>
   </div>
  );
 }

 if (view === "guest_otp") {
  return (
   <div
    className="glass"
    style={{
     padding: "2rem",
     borderRadius: "var(--radius)",
     position: "sticky",
     top: "100px",
    }}>
    <h3 style={{ textAlign: "center", margin: "0 0 1rem 0" }}>
     Verify Identity
    </h3>
    <p
     style={{
      fontSize: "0.9rem",
      color: "var(--text-muted)",
      marginBottom: "1.5rem",
      textAlign: "center",
     }}>
     Enter the 4-digit code sent to <strong>{guestEmail}</strong>
    </p>
    <form onSubmit={handleGuestOtpSubmit}>
     <input
      type="text"
      required
      placeholder="0000"
      maxLength="4"
      value={guestOtp}
      onChange={(e) => setGuestOtp(e.target.value)}
      style={{
       width: "100%",
       marginBottom: "1rem",
       letterSpacing: "0.5rem",
       textAlign: "center",
       fontSize: "1.5rem",
      }}
      autoFocus
     />
     {message && (
      <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem" }}>
       {message}
      </p>
     )}
     <button
      type="submit"
      className="btn btn-primary"
      disabled={loading}
      style={{ width: "100%" }}>
      {loading ? "Confirming..." : "Verify & Book"}
     </button>
     <p
      style={{
       marginTop: "1rem",
       textAlign: "center",
       fontSize: "0.8rem",
       cursor: "pointer",
       color: "var(--text-muted)",
      }}
      onClick={() => setView("guest_email")}>
      Wrong email? Go back
     </p>
    </form>
   </div>
  );
 }

 return (
  <div
   className="glass"
   style={{
    padding: "1.5rem",
    borderRadius: "18px",
    position: "sticky",
    top: "100px",
    boxShadow: "var(--shadow-lg)",
   }}>
   <h3 style={{ marginTop: 0, textAlign: "center", marginBottom: "1.5rem" }}>
    Make a reservation
   </h3>

   <div
    style={{
     display: "flex",
     flexDirection: "column",
     gap: "1rem",
     marginBottom: "1.5rem",
    }}>
    <div>
     <label
      style={{
       display: "block",
       marginBottom: "0.5rem",
       fontSize: "0.9rem",
       color: "var(--text-muted)",
      }}>
      Party Size
     </label>
     <select
      value={partySize}
      onChange={(e) => setPartySize(e.target.value)}
      style={{ width: "100%" }}>
      {[...Array(20)].map((_, i) => (
       <option key={i + 1} value={i + 1}>
        {i + 1} people
       </option>
      ))}
     </select>
    </div>

    <div
     style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
     <div>
      <label
       style={{
        display: "block",
        marginBottom: "0.5rem",
        fontSize: "0.9rem",
        color: "var(--text-muted)",
       }}>
       Date
      </label>
      <input
       type="date"
       value={selectedDate}
       onChange={(e) => setSelectedDate(e.target.value)}
       style={{ colorScheme: "dark" }}
      />
     </div>
     <div>
      <label
       style={{
        display: "block",
        marginBottom: "0.5rem",
        fontSize: "0.9rem",
        color: "var(--text-muted)",
       }}>
       Time
      </label>
      <select value={time} onChange={(e) => setTime(e.target.value)}>
       <option value="">Select time</option>
       {baseSlots.map((s) => (
        <option key={s} value={s}>
         {s}
        </option>
       ))}
      </select>
     </div>
    </div>
   </div>

   <div style={{ marginBottom: "1.5rem" }}>
    <p style={{ margin: "0 0 1rem 0", fontWeight: 600 }}>Available times:</p>
    <div
     style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "0.5rem",
     }}>
     {baseSlots.map((s) => {
      const isBooked = bookedSlots.includes(s);
      return (
       <button
        key={s}
        className={`btn ${time === s ? "btn-primary" : "btn-secondary"}`}
        style={{
         padding: "0.5rem",
         fontSize: "0.9rem",
         opacity: isBooked ? 0.5 : 1,
         textDecoration: isBooked ? "line-through" : "none",
         cursor: isBooked ? "not-allowed" : "pointer",
        }}
        disabled={isBooked}
        onClick={() => !isBooked && setTime(s)}>
        {s}
       </button>
      );
     })}
    </div>
   </div>

   <button
    className="btn btn-primary"
    style={{ width: "100%" }}
    disabled={!time || loading}
    onClick={handleInitialClick}>
    {loading ? "Processing..." : time ? "Confirm Reservation" : "Select a Time"}
   </button>

   <p
    style={{
     marginTop: "1rem",
     fontSize: "0.8rem",
     color: "var(--text-muted)",
     textAlign: "center",
    }}>
    <span role="img" aria-label="chart">
     📈
    </span>{" "}
    Booked 42 times today
   </p>
  </div>
 );
}
