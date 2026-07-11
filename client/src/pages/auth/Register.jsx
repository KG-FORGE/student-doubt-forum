import { useState } from "react";
import { Link } from "react-router-dom";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(formData);
  }

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <Card className="p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>

        <p className="mt-2 text-slate-600">
          Join the community and start learning together.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
          />

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-700"
            >
              Role
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <Button type="submit">Create Account</Button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
