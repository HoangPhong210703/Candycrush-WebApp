
export const WIDTH = 8; 
export const CANDY_COLORS = [
    '#FF8A80', // red
    '#FFD180', // orange
    '#FFFF8D', // yellow
    '#80FFD1', // green
    '#80D1FF', // blue
    '#D180FF', // purple
];
export const MOVES_LEFT = 2;
export const GOAL_SCORE = 100;


export const delay = ms => new Promise(res => setTimeout(res, ms));

export const findMatches = (board) => {
    const matches = new Set();
    if (!board || board.length === 0) 
        return matches;

    const checkLine = (getter, length, limit) => {
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < limit - 2; j++) {
                const idx1 = getter(i, j);
                const color1 = board[idx1];
                
                if (!color1) continue;
                const idx2 = getter(i, j + 1);
                const idx3 = getter(i, j + 2);

                if (board[idx2] === color1 && board[idx3] === color1) {
                    matches.add(idx1); matches.add(idx2); matches.add(idx3);
                    let k = 3;
                    while (j + k < limit && board[getter(i, j + k)] === color1) {
                        matches.add(getter(i, j + k)); k++;
                    }
                    j += (k - 1);
                }
            }
        }
    };
    checkLine((r, c) => r * WIDTH + c, WIDTH, WIDTH);
    checkLine((c, r) => r * WIDTH + c, WIDTH, WIDTH);

    return matches;
};


export const createInitialBoard = () => {
    let board = [];
    for (let i = 0; i < WIDTH * WIDTH; i++) {
        board.push(CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)]);
    }
    let initialMatches = findMatches(board);
    while (initialMatches.size > 0) {
        initialMatches.forEach(index => {
            board[index] = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
        });
        initialMatches = findMatches(board);
    }
    return board;
};


export const clearMatchesOnBoard = (board, matches) => {
    let newBoard = [...board];
    if (matches.size === 0) return newBoard;

    matches.forEach(index => {
        if (index >= 0 && index < newBoard.length) { newBoard[index] = null; }
    });
    return newBoard;
};


export const handleGravityAndRefill = (board) => {
    let newBoard = [...board];
    // Gravity
    for (let c = 0; c < WIDTH; c++) {
        let lowestEmptyIdx = -1;
        for (let r = WIDTH - 1; r >= 0; r--) {
            const currentIdx = r * WIDTH + c;
            if (lowestEmptyIdx === -1 && newBoard[currentIdx] === null) {
                lowestEmptyIdx = currentIdx;
            } else if (lowestEmptyIdx !== -1 && newBoard[currentIdx] !== null) {
                newBoard[lowestEmptyIdx] = newBoard[currentIdx];
                newBoard[currentIdx] = null;
                lowestEmptyIdx -= WIDTH;
            }
        }
    }
    // Refill
    for (let i = 0; i < WIDTH * WIDTH; i++) {
        if (newBoard[i] === null) {
            newBoard[i] = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
        }
    }
    return newBoard;
};