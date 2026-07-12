import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Landing from "../pages/public/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Questions from "../pages/public/Questions";
import AskQuestion from "../pages/questions/AskQuestion";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/ask" element={<AskQuestion />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
