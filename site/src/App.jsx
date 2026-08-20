import "./App.css";
import { Routes, Route } from "react-router";
import MainLayout from "./Layouts/Main-Layout";
import GameLayout from "./Layouts/Game-Layout";
import Home from "./Pages/Home";
import About from "./Pages/About";
// import Crossword from "./Pages/Crossword";

export default function App() {
  // return <Crossword />;
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="/game" element={<GameLayout />}>
        {/* <Route path="crossword" element={<Crossword />} /> */}
      </Route>
    </Routes>
  );
}
