import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Pricing() {
  const { user } = useAuth();

const handleUpgrade = async () => {
  try {
    // 1. Create order from backend (₹499 = 49900 paise if you want monthly)
    const orderRes = await axios.post(
      `${API}/subscription/create-order`,
      { amount: 19900 }, // 199 INR in paise
      { withCredentials: true }
    );

    const order = orderRes.data;

    // 2. Open Razorpay checkout
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Public key
      amount: order.amount,
      currency: order.currency,
      name: "AI Portfolio Builder",
      description: "Pro Subscription",
      order_id: order.id,
      handler: async function (response) {
        try {
          // 3. Verify payment on backend
          await axios.post(
            `${API}/subscription/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { withCredentials: true }
          );

          toast.success("🎉 Payment successful! You are now Pro.");

          // Optionally reload user / page
          window.location.reload();
        } catch (err) {
          toast.error("Payment verification failed");
        }
      },
      prefill: {
        email: user?.email || "",
        name: user?.name || "",
      },
      theme: {
        color: "#4F46E5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error(error);
    toast.error("Failed to start payment");
  }
};


  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      features: [
        "1 Portfolio",
        "Basic Templates",
        "Manual Content Entry",
        "Portfolio Watermark",
        "Public Portfolio Link",
      ],
      current: user?.subscription_plan === "free",
      cta: "Current Plan",
    },
    {
      name: "Pro",
      price: "₹199",
      period: "forever",
      features: [
        "Unlimited Portfolios",
        "All Premium Templates",
        "AI Content Generation",
        "AI Resume Parsing",
        "GitHub Integration",
        "Live Project Link Upload",
        "Custom Colors & Themes",
        "No Watermark",
        "Custom Domain (Coming Soon)",
      ],
      highlighted: true,
      current: user?.subscription_plan === "pro",
      cta: user?.subscription_plan === "pro" ? "Current Plan" : "Upgrade to Pro",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />

      {/* Navbar */}
       <nav className="relative z-20 fixed top-0 left-0 right-0 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-bold text-xl"
          >
            <Crown className="w-6 h-6 text-sky-400" />
            <span style={{ fontFamily: "Outfit" }}>PortfolioAI</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" className="border-slate-700/60 text-slate-200 bg-white/5 backdrop-blur hover:bg-white/10 hover:border-sky-400/50 hover:text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]"> Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost" className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-sky-500 hover:bg-sky-400 text-black font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4"
            style={{ fontFamily: "Outfit" }}
          >
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Start free and upgrade when you're ready to unlock AI-powered
            features.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-slate-900/40 p-8 backdrop-blur transition ${
                plan.highlighted
                  ? "ring-2 ring-sky-500/60 shadow-[0_0_40px_rgba(56,189,248,0.25)]"
                  : "hover:bg-slate-900/60"
              }`}
              data-testid={`pricing-card-${plan.name.toLowerCase()}`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-sky-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h2
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "Outfit" }}
                >
                  {plan.name}
                </h2>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-400">/{plan.period}</span>
                </div>

                {/* CTA */}
                {plan.current ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full border-slate-700 text-slate-400"
                  >
                    {plan.cta}
                  </Button>
                ) : plan.name === "Pro" ? (
                  !user ? (
                   <Link to="/login">
                     <Button className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold">
                       {plan.cta}
                     </Button>
                   </Link>
                 ) : (
                   <Button
                     onClick={handleUpgrade}
                     className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold"
                   >
                     {plan.cta}
                   </Button>
                 )
                ) : (
                  <Link to="/signup">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-white hover:bg-slate-800"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-20 text-center">
          <p className="text-slate-400">
            Have questions?{" "}
            <a
              href="mailto:support@example.com"
              className="text-sky-400 hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
