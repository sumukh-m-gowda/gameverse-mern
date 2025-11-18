import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

// Game Pages
import TicTacToe from "./pages/TicTacToe";
import Sudoku from "./pages/Sudoku";
import Minesweeper from "./pages/Minesweeper";
import RPS from "./pages/RPS";
import Dice from "./pages/Dice";
import Game2048 from "./pages/Game2048";
import HandCricket from "./pages/HandCricket";
import TowerOfHanoi from "./pages/TowerOfHanoi";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Games */}
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/sudoku" element={<Sudoku />} />
        <Route path="/minesweeper" element={<Minesweeper />} />
        <Route path="/rps" element={<RPS />} />
        <Route path="/dice" element={<Dice />} />
        <Route path="/2048" element={<Game2048 />} />
        <Route path="/handcricket" element={<HandCricket />} />
        <Route path="/tower" element={<TowerOfHanoi />} />
      </Routes>
    </BrowserRouter>
  );
}
