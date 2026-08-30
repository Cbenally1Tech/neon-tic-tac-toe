import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  emptyBoard,
  getWinner,
  isDraw,
  type Board,
  type Player,
} from "./game";
import "./App.css";

gsap.registerPlugin(useGSAP);

type Scores = { X: number; O: number; ties: number };

export default function App() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Player>("X");
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, ties: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLHeadingElement>(null);

  const winner = getWinner(board);
  const draw = isDraw(board);
  const gameOver = Boolean(winner || draw);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(brandRef.current, {
        y: -28,
        opacity: 0,
        duration: 0.7,
        filter: "blur(8px)",
      }).from(
        ".cell",
        {
          scale: 0.55,
          opacity: 0,
          duration: 0.45,
          stagger: { each: 0.05, from: "center" },
          ease: "back.out(1.6)",
        },
        "-=0.35",
      );
    },
    { scope: rootRef },
  );

  function playMark(index: number, player: Player) {
    const cell = boardRef.current?.children[index] as HTMLElement | undefined;
    const markEl = cell?.querySelector(".mark");
    if (!markEl) return;
    gsap.fromTo(
      markEl,
      { scale: 0.2, opacity: 0, rotate: player === "X" ? -25 : 25 },
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 0.4,
        ease: "back.out(2.2)",
      },
    );
  }

  function flashWin(line: number[]) {
    const cells = line
      .map((i) => boardRef.current?.children[i] as HTMLElement | undefined)
      .filter(Boolean) as HTMLElement[];
    gsap.fromTo(
      cells,
      { boxShadow: "0 0 0px #b8ff3c00" },
      {
        boxShadow: "0 0 28px #b8ff3c88",
        duration: 0.35,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      },
    );
  }

  function handleClick(index: number) {
    if (board[index] || gameOver) return;

    const next = board.slice() as Board;
    next[index] = turn;
    setBoard(next);
    requestAnimationFrame(() => playMark(index, turn));

    const win = getWinner(next);
    if (win) {
      setScores((s) => ({ ...s, [win.player]: s[win.player] + 1 }));
      requestAnimationFrame(() => flashWin(win.line));
      return;
    }
    if (isDraw(next)) {
      setScores((s) => ({ ...s, ties: s.ties + 1 }));
      return;
    }
    setTurn(turn === "X" ? "O" : "X");
  }

  function resetRound() {
    setBoard(emptyBoard());
    setTurn("X");
    gsap.fromTo(
      ".cell",
      { scale: 0.92 },
      { scale: 1, duration: 0.35, stagger: 0.03, ease: "power2.out" },
    );
  }

  function resetScores() {
    setScores({ X: 0, O: 0, ties: 0 });
    resetRound();
  }

  let status: ReactNode;
  if (winner) {
    status = (
      <>
        <span className="status__mark status__mark--win">{winner.player}</span>
        takes the round
      </>
    );
  } else if (draw) {
    status = <>gridlock — draw</>;
  } else {
    status = (
      <>
        <span className={`status__mark status__mark--${turn.toLowerCase()}`}>
          {turn}
        </span>
        to move
      </>
    );
  }

  return (
    <div className="stage" ref={rootRef}>
      <div className="stage__glow" aria-hidden="true" />
      <div className="stage__grid" aria-hidden="true" />

      <main className="panel">
        <h1 className="brand" ref={brandRef}>
          <span className="brand__name">NEON</span>
          <span className="brand__tag">Tic Tac Toe</span>
        </h1>

        <p className="status" aria-live="polite">
          {status}
        </p>

        <div
          className="board"
          ref={boardRef}
          role="grid"
          aria-label="Tic tac toe board"
        >
          {board.map((cell, i) => {
            const isWin = winner?.line.includes(i) ?? false;
            return (
              <button
                key={i}
                type="button"
                className={`cell${isWin ? " cell--win" : ""}`}
                role="gridcell"
                aria-label={
                  cell
                    ? `Cell ${i + 1}, ${cell}`
                    : `Cell ${i + 1}, empty`
                }
                disabled={Boolean(cell) || gameOver}
                onClick={() => handleClick(i)}
              >
                {cell && (
                  <span className={`mark mark--${cell.toLowerCase()}`}>
                    {cell}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="scoreboard" aria-label="Score">
          <div className="score score--x">
            <span>PLAYER X</span>
            <span className="score__value">{scores.X}</span>
          </div>
          <div className="score score__ties">
            <span>TIES</span>
            <span className="score__value">{scores.ties}</span>
          </div>
          <div className="score score--o">
            <span>PLAYER O</span>
            <span className="score__value">{scores.O}</span>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={resetRound}>
            New Round
          </button>
          <button type="button" className="btn btn--ghost" onClick={resetScores}>
            Reset Scores
          </button>
        </div>
      </main>
    </div>
  );
}
