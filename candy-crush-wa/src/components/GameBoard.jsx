import { useState, useEffect, useCallback } from "react";
import "./GameBoard.css";

const size = 8;
const candyColors = ["red", "blue", "green", "yellow", "purple", "orange"];

const createBoard = () => {
    return Array.from({ length: size * size }, () =>
        candyColors[Math.floor(Math.random() * candyColors.length)]
    );
};

export default function GameBoard() {
    const [board, setBoard] = useState(createBoard);
    const [draggedCandy, setDraggedCandy] = useState(null);
    const [replacedCandy, setReplacedCandy] = useState(null);

    const checkMatches = useCallback(() => {
        let newBoard = [...board];
        let matchesFound = false;

        // Check for horizontal matches
        for (let i = 0; i < size * size; i++) {
            if (i % size > size - 3) continue;
            const row = [i, i + 1, i + 2];
            if (row.every(index => newBoard[index] && newBoard[index] === newBoard[i])) {
                row.forEach(index => newBoard[index] = "");
                matchesFound = true;
            }
        }

        // Check for vertical matches
        for (let i = 0; i < size * (size - 2); i++) {
            const column = [i, i + size, i + size * 2];
            if (column.every(index => newBoard[index] && newBoard[index] === newBoard[i])) {
                column.forEach(index => newBoard[index] = "");
                matchesFound = true;
            }
        }

        if (matchesFound) {
            setBoard(newBoard);
        }
    }, [board]);

    const dropCandies = useCallback(() => {
        let newBoard = [...board];

        for (let i = size * size - 1; i >= 0; i--) {
            if (newBoard[i] === "") {
                if (i >= size) {
                    newBoard[i] = newBoard[i - size];
                    newBoard[i - size] = "";
                } else {
                    newBoard[i] = candyColors[Math.floor(Math.random() * candyColors.length)];
                }
            }
        }

        setBoard(newBoard);
    }, [board]);

    useEffect(() => {
        const timer = setInterval(() => {
            checkMatches();
            dropCandies();
        }, 300);

        return () => clearInterval(timer);
    }, [checkMatches, dropCandies]);

    return (
        <div className="board">
            {board.map((color, index) => (
                <div
                    key={index}
                    className="candy"
                    style={{ backgroundColor: color }}
                    draggable
                    onDragStart={() => setDraggedCandy(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => setReplacedCandy(index)}
                    onDragEnd={() => {
                        if (draggedCandy !== null && replacedCandy !== null) {
                            const validMoves = [
                                draggedCandy - 1, 
                                draggedCandy + 1, 
                                draggedCandy - size, 
                                draggedCandy + size,
                            ];

                            if (validMoves.includes(replacedCandy)) {
                                let newBoard = [...board];
                                [newBoard[draggedCandy], newBoard[replacedCandy]] = [newBoard[replacedCandy], newBoard[draggedCandy]];
                                setBoard(newBoard);
                            }
                        }
                        setDraggedCandy(null);
                        setReplacedCandy(null);
                    }}
                />
            ))}
        </div>
    );
}
