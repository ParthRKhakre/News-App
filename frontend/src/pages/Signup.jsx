import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.username.trim()) {
      nextErrors.username = "Username is required.";
    }
    if (form.password.trim().length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-[36px] bg-white p-8 shadow-card sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ember">Get started</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink">Create your account</h1>
        <p className="mt-3 text-slate-500">
          Start verifying stories, storing proof, and building a trust trail.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            error={errors.username}
            onChange={(event) =>
              setForm((current) => ({ ...current, username: event.target.value }))
            }
          />
          <Input
            label="Password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            error={errors.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>Role</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-orange-100"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
            >
              <option value="user">User</option>
              <option value="reporter">Reporter</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-ember" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
