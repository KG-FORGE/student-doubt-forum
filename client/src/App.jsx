import Button from "./components/common/Button";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-4">
      <Button>Login</Button>

      <Button variant="secondary">Register</Button>

      <Button variant="danger">Delete</Button>
    </div>
  );
}

export default App;
