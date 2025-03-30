
import React, { useState, useEffect, useCallback } from 'react';
import './GameBoard.css';
import {
    WIDTH,
    CANDY_COLORS,
    delay,
    findMatches,
    createInitialBoard,
    clearMatchesOnBoard,
    handleGravityAndRefill,
    MOVES_LEFT,
    GOAL_SCORE
} from '../utils/GameLogic.jsx'; 

function GameBoard() {
    const [board, setBoard] = useState(() => createInitialBoard());
    const [draggedTile, setDraggedTile] = useState(null);
    const [replacedTile, setReplacedTile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [score, setScore] = useState(0);
    const [movesLeft, setMovesLeft] = useState(MOVES_LEFT);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false); 

    const handleDragStart = (index) => {
        if (isProcessing || gameOver || gameWon || movesLeft <= 0) { 
            return;
        }
        setDraggedTile(index);
    };

    const handleDrop = (index) => {
        if (isProcessing || gameOver || gameWon || movesLeft <= 0) { 
            return;
        }
        setReplacedTile(index);
    };

    const handleDragEnd = useCallback(async () => {
        if (isProcessing || draggedTile === null || replacedTile === null || gameOver || gameWon || movesLeft <= 0) { 
            setDraggedTile(null);
            setReplacedTile(null);
            return;
        }

        const currentDraggedIndex = draggedTile;
        const currentReplacedIndex = replacedTile;
        const validMoves = [
            currentDraggedIndex - 1, currentDraggedIndex + 1,
            currentDraggedIndex - WIDTH, currentDraggedIndex + WIDTH,
        ];
        const isValidMove = validMoves.includes(currentReplacedIndex);
        const isSameColor = board[currentDraggedIndex] === board[currentReplacedIndex];

        if (!isValidMove || isSameColor) {
            setDraggedTile(null);
            setReplacedTile(null);
            return;
        }

        let tempBoard = [...board];
        [tempBoard[currentDraggedIndex], tempBoard[currentReplacedIndex]] = [tempBoard[currentReplacedIndex], tempBoard[currentDraggedIndex]];

        const matchesAfterSwap = findMatches(tempBoard);

        if (matchesAfterSwap.size > 0) {
            setMovesLeft(prevMoves => prevMoves - 1); 
            setBoard(tempBoard);
            setDraggedTile(null);
            setReplacedTile(null);

            await handleGameCycle(tempBoard);
        } else {

            setDraggedTile(null);
            setReplacedTile(null);
        }

    }, [board, draggedTile, replacedTile, isProcessing, movesLeft, gameOver, gameWon]); 


    const handleGameCycle = useCallback(async (currentBoard) => {
        setIsProcessing(true);
        let boardAfterCycle = [...currentBoard];
        let currentMatches = findMatches(boardAfterCycle);

        while (currentMatches.size > 0) {
            setScore(prevScore => prevScore + currentMatches.size * 100);
            await delay(250);
            boardAfterCycle = clearMatchesOnBoard(boardAfterCycle, currentMatches);
            setBoard(boardAfterCycle);
            await delay(250);
            boardAfterCycle = handleGravityAndRefill(boardAfterCycle);
            setBoard(boardAfterCycle);
            currentMatches = findMatches(boardAfterCycle);
        }

        setIsProcessing(false);

        // if (movesLeft <= 0 && score < GOAL_SCORE) {
        //     setGameOver(true);
        // }

    }, []); 


    useEffect(() => {
        if (!isProcessing && movesLeft <= 0) {
            if (score < GOAL_SCORE) {
                setGameOver(true);
                console.log("useEffect: Game Over set");
            } else {
                setGameWon(true); 
                console.log("useEffect: Game Won set");
            }
        }
    }, [movesLeft, score, isProcessing]); 


    return (
        <div className="game-container">
            <h2>Candy Crush</h2>
            <div className="game-info">
                <span>Score: {score}</span>
                <span>Moves: {movesLeft}</span>
            </div>
            {}
            {gameOver && <div className="game-over-message">Game Over</div>}
            {gameWon && <div className="game-won-message">You Win</div>}

            <div className="game-board">
                {board.map((candyColor, index) => (
                    <div
                        key={index}
                        className={`tile ${isProcessing || gameOver || gameWon ? 'disabled' : ''}`} 
                        style={{
                            backgroundColor: candyColor ? candyColor : '#e0e0e0',
                        }}
                        draggable={!isProcessing && !gameOver && !gameWon} 
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        data-dragging={draggedTile === index}
                    >
                        {}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GameBoard;