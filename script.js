document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startButton = document.getElementById('start-button');
    const debugInfo = document.getElementById('debug-info');
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const moveHistoryElement = document.getElementById('move-history');
    
    // Game State
    let game;
    let selectedSquare = null;
    let possibleMoves = [];

    // Initialize Game
    startButton.addEventListener('click', () => {
        debugInfo.style.display = 'block';
        debugInfo.innerHTML = 'Initializing...<br>';

        try {
            // 1. Verify Chess.js is loaded
            if (typeof Chess === 'undefined') {
                throw new Error("Chess.js not loaded - check script tags");
            }
            debugInfo.innerHTML += 'Chess.js loaded<br>';

            // 2. Create instance (no method checks)
            game = new Chess();
            debugInfo.innerHTML += 'Game created<br>';
            
            // 3. Verify basic functionality
            try {
                game.move('e4');
                game.reset();
                debugInfo.innerHTML += 'Basic moves working<br>';
            } catch (e) {
                throw new Error("Chess.js not functional: " + e.message);
            }

            // 4. Initialize UI
            startButton.style.display = 'none';
            boardElement.style.display = 'grid';
            moveHistoryElement.style.display = 'block';
            
            // 5. Create initial board
            createBoard();
            debugInfo.innerHTML += 'Ready!<br>';

            // Hide debug after 3 seconds
            setTimeout(() => {
                debugInfo.style.display = 'none';
            }, 3000);

        } catch (e) {
            console.error("Initialization error:", e);
            debugInfo.innerHTML += `ERROR: ${e.message}<br>`;
            statusElement.textContent = `Initialization failed: ${e.message}`;
        }
    });

    // Create the chess board
    function createBoard() {
        boardElement.innerHTML = '';
        
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((rank + file) % 2 === 0 ? 'light' : 'dark');
                
                const squareName = String.fromCharCode(97 + file) + (8 - rank);
                square.dataset.square = squareName;
                
                // Add piece if exists
                const piece = game.get(squareName);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.style.backgroundImage = `url('pieces/${piece.color}${piece.type}.svg')`;
                    square.appendChild(pieceElement);
                }
                
                square.addEventListener('click', () => handleSquareClick(square));
                boardElement.appendChild(square);
            }
        }
        
        updateStatus();
    }

    // Handle square clicks
    function handleSquareClick(square) {
        const squareName = square.dataset.square;
        const piece = game.get(squareName);
        
        // Case 1: No selection + valid piece clicked
        if (!selectedSquare && piece && piece.color === game.turn()) {
            selectSquare(square, squareName);
        } 
        // Case 2: Selected square clicked again
        else if (selectedSquare === square) {
            clearSelection();
        }
        // Case 3: Attempt to move
        else if (selectedSquare) {
            attemptMove(square, squareName);
        }
    }

    function selectSquare(square, squareName) {
        selectedSquare = square;
        square.classList.add('selected');
        
        possibleMoves = game.moves({
            square: squareName,
            verbose: true
        });
        
        // Highlight possible moves
        possibleMoves.forEach(move => {
            document.querySelector(`[data-square="${move.to}"]`)
                .classList.add('highlight');
        });
    }

    function attemptMove(targetSquare, targetSquareName) {
        const move = possibleMoves.find(m => m.to === targetSquareName);
        
        if (move) {
            game.move(move);
            addMoveToHistory(move);
            createBoard();
        }
		else {
            clearSelection();
        }
    }

    function clearSelection() {
        if (selectedSquare) {
            selectedSquare.classList.remove('selected');
            selectedSquare = null;
        }
        
        document.querySelectorAll('.highlight').forEach(el => {
            el.classList.remove('highlight');
        });
        
        possibleMoves = [];
    }

    // Universal status update (works without isCheckmate/isDraw)
    function updateStatus() {
        const turn = game.turn();
        const moves = game.moves({ verbose: true });
        
        let status;
        
        if (moves.length === 0) {
            // Check if king is in check (manual checkmate detection)
            const kingPos = findKingPosition(game.board(), turn);
            const isCheck = kingPos && isSquareUnderAttack(game, kingPos, turn === 'w' ? 'b' : 'w');
            
            status = isCheck 
                ? `Checkmate! ${turn === 'w' ? 'Black' : 'White'} wins` 
                : 'Draw (stalemate)';
        } else {
            status = `${turn === 'w' ? 'White' : 'Black'}'s turn`;
            
            // Manual check detection
            const kingPos = findKingPosition(game.board(), turn);
            if (kingPos && isSquareUnderAttack(game, kingPos, turn === 'w' ? 'b' : 'w')) {
                status += ' (Check)';
            }
        }
        
        statusElement.textContent = status;
    }

    // Helper: Find king position
    function findKingPosition(board, color) {
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = board[rank][file];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return String.fromCharCode(97 + file) + (8 - rank);
                }
            }
        }
        return null;
    }

    // Helper: Check if square is under attack
    function isSquareUnderAttack(game, square, byColor) {
        const moves = game.moves({ verbose: true });
        return moves.some(move => 
            move.to === square && 
            move.color === byColor &&
            !move.flags.includes('p') // Exclude pawn pushes
        );
    }

    function addMoveToHistory(move) {
        const moveEntry = document.createElement('div');
        moveEntry.classList.add('move-entry');
        moveEntry.textContent = `${move.color === 'w' ? 'White' : 'Black'}: ${move.san}`;
        moveHistoryElement.appendChild(moveEntry);
        moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
    }
});