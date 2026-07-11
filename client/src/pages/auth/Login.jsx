import { useState } from "react";
import { Link } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  }

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <Card className="p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-slate-600">
          Login to continue learning and helping others.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          <Button type="submit">
            Login
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;