import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import Update from "./pages/Update";
import Resolve from "./pages/Resolve";
import Docs from "./pages/Docs";
import Validators from "./pages/Validators";
import ValidatorPropose from "./pages/ValidatorPropose";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/update" element={<Update />} />
        <Route path="/resolve" element={<Resolve />} />
        <Route path="/resolve/:did" element={<Resolve />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/validators" element={<Validators />} />
        <Route path="/validators/propose" element={<ValidatorPropose />} />
      </Routes>
    </BrowserRouter>
  );
}
