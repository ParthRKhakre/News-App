import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] bg-white shadow-card lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-ink bg-hero-mesh p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200">
            Tez News
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Verify every story before it goes viral.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-200">
            Swipe through an Inshorts-style news feed, score authenticity in seconds,
            and store verified proof on-chain when it matters.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          <h2 className="font-display text-3xl font-bold text-ink">Login</h2>
          <p className="mt-3 text-slate-500">Access your verification feed and history.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Username"
              placeholder="Enter your username"
              value={form.username}
              error={errors.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              error={errors.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New here?{" "}
            <Link className="font-semibold text-ember" to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
