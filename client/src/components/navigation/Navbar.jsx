import { Link } from "react-router-dom";
import Button from "../common/Button";

function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-slate-900">
          DoubtForum
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="secondary">Login</Button>
          </Link>

          <Link to="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
