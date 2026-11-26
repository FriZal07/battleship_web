import { Ship, Gameboard } from './ship.js';

let score = 0;

export default function ui_load() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div id="container">
            <div id="top_container">
                <button id="rotate_btn">Orientation: Horizontal</button>
                <button id="reset_btn">Reset Board</button>
                <span id="score_display">Score: ${score}</span>
            </div>

            <div id="middle_container">
                <div id="left_container">
                    <div class="gameBoard"></div>
                </div>
                <div id="right_container">
                    <div class="cell" draggable="true" data-index="0">Carrier</div>
                    <div class="cell" draggable="true" data-index="1">Battleship</div>
                    <div class="cell" draggable="true" data-index="2">Cruiser</div>
                    <div class="cell" draggable="true" data-index="3">Submarine</div>
                    <div class="cell" draggable="true" data-index="4">Destroyer</div>
                </div>
            </div>
            <div id="bottom_container">
                <button id="start_btn">Start Game</button>
            </div>
        </div>
    `;

    let newBoard = new Gameboard();
    let enemyBoard = null;
    let gameStarted = false;
    let orientation = "hori";
    let current_ships = [
        new Ship("Carrier", 5),
        new Ship("Battleship", 4),
        new Ship("Cruiser", 3),
        new Ship("Submarine", 3),
        new Ship("Destroyer", 2)
    ];

    const rotateBtn = document.getElementById("rotate_btn");
    rotateBtn.addEventListener("click", () => {
        orientation = orientation === "hori" ? "verti" : "hori";
        rotateBtn.textContent = `Orientation: ${orientation === "hori" ? "Horizontal" : "Vertical"}`;
    });

    const gameBoardEl = document.querySelector('.gameBoard');
    for (let i = 0; i < 100; i++) {
        const board_cell = document.createElement('div');
        board_cell.classList.add('board_cells');
        board_cell.setAttribute('data-index', i);
        gameBoardEl.appendChild(board_cell);
    }

    const startBtn = document.getElementById("start_btn");
    const resetBtn = document.getElementById("reset_btn");
    const scoreDisplay = document.getElementById("score_display");
    const ship_choices = document.querySelectorAll('.cell');
    const board_cells = document.querySelectorAll('.board_cells');
    const rightContainer = document.getElementById('right_container');

    let draggedShipObj = null;
    let draggedSourceEl = null;
    let draggedFromBoard = false;

    function renderBoard() {
        board_cells.forEach((cell, idx) => {
            const x = idx % 10;
            const y = Math.floor(idx / 10);
            const shipAtCell = newBoard.getShipAt([x, y]);

            if (shipAtCell) {
                cell.style.backgroundColor = 'steelblue';
                cell.setAttribute('draggable', 'true');
            } else {
                cell.style.backgroundColor = '';
                cell.removeAttribute('draggable');
            }
        });
    }

    function enemyTurn() {
        let randX, randY;
        do {
            randX = Math.floor(Math.random() * 10);
            randY = Math.floor(Math.random() * 10);
        } while (newBoard.isblockAlreadyAttacked([randX, randY]));

        newBoard.blockAttacked([randX, randY]);
        const idx = randY * 10 + randX;

        if (newBoard.getShipAt([randX, randY]) !== null) {
            board_cells[idx].style.backgroundColor = 'red';
        } else {
            board_cells[idx].style.backgroundColor = 'blue';
        }

        if (newBoard.returnshipremaining() === 0) {
            alert("You lost!");
            ui_load();
        }
    }

    function startGame() {
        if (newBoard.returnshipremaining() !== current_ships.length) {
            alert("Place all 5 ships first!");
            return;
        }

        gameStarted = true;
        enemyBoard = new Gameboard();

        // Lock player's left board so ships can't be dragged anymore
        board_cells.forEach((cell) => cell.removeAttribute('draggable'));

        // Randomly place enemy ships
        const enemy_ships = [
            new Ship("Carrier", 5),
            new Ship("Battleship", 4),
            new Ship("Cruiser", 3),
            new Ship("Submarine", 3),
            new Ship("Destroyer", 2)
        ];

        enemy_ships.forEach((ship) => {
            let placed = false;
            while (!placed) {
                const randX = Math.floor(Math.random() * 10);
                const randY = Math.floor(Math.random() * 10);
                const randOrient = Math.random() < 0.5 ? "hori" : "verti";
                placed = enemyBoard.placeShip([randX, randY], ship, randOrient);
            }
        });

        // Replace right container with the enemy's 10x10 board
        rightContainer.innerHTML = `<div class="gameBoard" id="enemy_board"></div>`;
        const enemyBoardEl = document.getElementById('enemy_board');

        for (let i = 0; i < 100; i++) {
            const enemy_cell = document.createElement('div');
            enemy_cell.classList.add('board_cells');
            enemy_cell.setAttribute('data-index', i);

            enemy_cell.addEventListener('click', () => {
                const grid = [i % 10, Math.floor(i / 10)];
                if (enemyBoard.isblockAlreadyAttacked(grid)) return;

                enemyBoard.blockAttacked(grid);

                if (enemyBoard.getShipAt(grid) !== null) {
                    enemy_cell.style.backgroundColor = 'red';
                } else {
                    enemy_cell.style.backgroundColor = 'blue';
                }

                if (enemyBoard.returnshipremaining() === 0) {
                    score++;
                    scoreDisplay.textContent = `Score: ${score}`;
                    alert("You won!");
                    ui_load();
                    return;
                }

                // Enemy shoots back at your left board
                enemyTurn();
            });

            enemyBoardEl.appendChild(enemy_cell);
        }

        alert("Game Started! Click the right board to shoot.");
    }

    startBtn.addEventListener("click", startGame);

    ship_choices.forEach((shipEl) => {
        shipEl.addEventListener('dragstart', () => {
            if (gameStarted) return;
            const idx = Number(shipEl.getAttribute('data-index'));
            draggedShipObj = current_ships[idx];
            draggedSourceEl = shipEl;
            draggedFromBoard = false;
        });
    });

    board_cells.forEach((cell) => {
        cell.addEventListener('dragstart', (e) => {
            if (gameStarted) {
                e.preventDefault();
                return;
            }
            const idx = Number(cell.getAttribute('data-index'));
            const grid = [idx % 10, Math.floor(idx / 10)];
            const shipAtCell = newBoard.getShipAt(grid);

            if (!shipAtCell) {
                e.preventDefault();
                return;
            }

            draggedShipObj = shipAtCell;
            draggedFromBoard = true;
            newBoard.removeShip(shipAtCell);
            renderBoard();
        });

        cell.addEventListener('dragover', (e) => {
            if (!draggedShipObj || gameStarted) return;
            const idx = Number(cell.getAttribute('data-index'));
            const grid = [idx % 10, Math.floor(idx / 10)];

            if (newBoard.shipplaceable(grid, draggedShipObj, orientation)) {
                e.preventDefault();
            }
        });

        cell.addEventListener('drop', (e) => {
            if (!draggedShipObj || gameStarted) return;
            e.preventDefault();

            const idx = Number(cell.getAttribute('data-index'));
            const grid = [idx % 10, Math.floor(idx / 10)];

            if (newBoard.placeShip(grid, draggedShipObj, orientation)) {
                if (!draggedFromBoard && draggedSourceEl) {
                    draggedSourceEl.style.display = 'none';
                }
                renderBoard();
            }

            draggedShipObj = null;
            draggedSourceEl = null;
            draggedFromBoard = false;
        });
    });

    rightContainer.addEventListener('dragover', (e) => {
        if (draggedFromBoard && draggedShipObj && !gameStarted) {
            e.preventDefault();
        }
    });

    rightContainer.addEventListener('drop', (e) => {
        if (!draggedFromBoard || !draggedShipObj || gameStarted) return;
        e.preventDefault();

        const shipIdx = current_ships.indexOf(draggedShipObj);
        if (shipIdx !== -1) {
            ship_choices[shipIdx].style.display = '';
        }

        renderBoard();
        draggedShipObj = null;
        draggedSourceEl = null;
        draggedFromBoard = false;
    });

    resetBtn.addEventListener("click", () => {
        ui_load();
    });
}