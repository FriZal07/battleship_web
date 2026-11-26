import { Ship, Gameboard } from '../src/ship.js';

describe("Ship Class Test", () => {

    beforeAll(() => {
        newBoard = new Gameboard();
        destroyer_ship = new Ship("Destroyer", 4);
        frigate_ship = new Ship("frigate", 2);
        tiny_ship = new Ship("tiny", 2);

        newBoard.placeShip([0,0],destroyer_ship,"verti");
        newBoard.placeShip([2,2],frigate_ship,"hori");
        newBoard.placeShip([3,4],tiny_ship,"hori");
    });

    test("Sinking the frigate",() => {
        newBoard.blockAttacked([2,2]);
        newBoard.blockAttacked([3,2]);
        expect(frigate_ship.isSunk()).toBe(true);
    });

    test("Sinking the destroyer",() => {
        newBoard.blockAttacked([0,0]);
        newBoard.blockAttacked([0,1]);
        newBoard.blockAttacked([0,2]);
        newBoard.blockAttacked([0,3]);
        expect(destroyer_ship.isSunk()).toBe(true);
    });

    test("Invaliding placing the ships out of bounds",() => {
        battleship_ship = new Ship("Battleship_ship", 2);
        expect(newBoard.placeShip([6,9],destroyer_ship,"verti")).toBe(false);
    });

    test("Invaliding placing ships the ship in position taken by other ships",() => {
        battleship_ship = new Ship("Battleship_ship", 2);
        expect(newBoard.placeShip([0,0],battleship_ship,"verti")).toBe(false);
    });

    test("Checking the already attacked blocks, and see attacking multiple time duplicate or not",() => {
        newBoard.blockAttacked([0,3]);
        newBoard.blockAttacked([0,3]);
        expect(newBoard.returnattackedblocks()).toEqual([
        [2, 2],
        [3, 2],
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        ]);
    });
    
    test("Checking if ship still remains after receiving partial damage",() => {
        newBoard.blockAttacked([3,4]);
        expect(newBoard.returnshipremaining()).toBe(1);
    });

    test("Attacking out of bound areas",() => {
        expect(newBoard.blockAttacked([100,300])).toBe(false);
        expect(newBoard.blockAttacked([0,300])).toBe(false);
        expect(newBoard.blockAttacked([-1,-3])).toBe(false);
    });

    test("Attacking valid area",() => {
        expect(newBoard.blockAttacked([2,4])).toBeUndefined();
    });

    test("Seeing if all ships sank and the player of this board loses",() => {
        newBoard.blockAttacked([4,4]);
        expect(newBoard.returnshipremaining()).toBe(0);
    });
});