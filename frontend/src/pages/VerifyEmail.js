import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const calledRef = useRef(false); // 👈 guard

  useEffect(() => {
    if (calledRef.current) return; // 👈 prevent double call
    calledRef.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    axios
      .get(`${API}/auth/verify?token=${token}`)
      .then((res) => {
        console.log("Verify success:", res.data);
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        console.error("Verify error:", err);
        setStatus("error");
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && <p>✅ Email verified! Redirecting to login...</p>}
      {status === "error" && <p>❌ Invalid or expired verification link.</p>}
    </div>
  );
}