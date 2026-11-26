class Ship {

    #name;
    #hit_required;
    #current_hit;
    #sunk;

    constructor(shipname, hit_required){
        this.#name = shipname;
        this.#hit_required = hit_required;
        this.#current_hit = 0;
        this.#sunk = false;
    }

    shipName(){
        return this.#name;
    }

    hitRequired(){
        return this.#hit_required;
    }

    currentHit(){
        return this.#current_hit;
    }

    isSunk(){
        return this.#sunk;
    }

    hit(){
        if (this.#sunk === true) return;
        this.#current_hit++;
        if (this.#current_hit == this.#hit_required) this.#sunk = true;
    }
}

class Gameboard{

    static board_array_size = 5;

    #board = Object.seal(Array.from({ length: Gameboard.board_array_size }, () => Object.seal(new Array(Gameboard.board_array_size).fill(null))));
    #shipCountRemaining = [];
    #attackedblocks = [];

    returnattackedblocks(){
        return this.#attackedblocks;
    }

    returnshipremaining(){
        return this.#shipCountRemaining;
    }

    placeShip(current_grid,ship_ref,orientation){

        let ship_length = ship_ref.hitRequired();

        if (
            current_grid[0] < 0 ||
            current_grid[0] >= Gameboard.board_array_size ||
            current_grid[1] < 0 ||
            current_grid[1] >= Gameboard.board_array_size
            ) {
            return false;
        }

        if (orientation == "hori"){
            let hori_max_len = current_grid[0] + (ship_length - 1);
            if (hori_max_len >= Gameboard.board_array_size || current_grid[0] < 0 || current_grid[1] < 0 ) return false;
            for (let i = 0; i < ship_length; i++) {
                if (this.#board[current_grid[0]+i][current_grid[1]] != null) return false;
            }
            for (let i = 0; i < ship_length; i++) {
                this.#board[current_grid[0]+i][current_grid[1]] = ship_ref;
            }
        } else if (orientation == "verti"){
            let verti_max_len = current_grid[1] + (ship_length - 1);
            if (verti_max_len >= Gameboard.board_array_size || current_grid[0] < 0 || current_grid[1] < 0 ) return false;
            for (let i = 0; i < ship_length; i++) {
                if (this.#board[current_grid[0]][current_grid[1]+i]  != null) return false;
            }
            for (let i = 0; i < ship_length; i++) {
                this.#board[current_grid[0]][current_grid[1]+i] = ship_ref;
            }
        } else{
            return false;
        }

        this.#shipCountRemaining++;
        return true;  
    }

    isblockAlreadyAttacked(current_grid){
        return this.#attackedblocks.some(
            (block) => block[0] === current_grid[0] && block[1] === current_grid[1]
        );
    }

    blockAttacked(current_grid){
        if (
            current_grid[0] < 0 ||
            current_grid[0] >= Gameboard.board_array_size ||
            current_grid[1] < 0 ||
            current_grid[1] >= Gameboard.board_array_size
            ) {
            return false;
        }
        if (this.isblockAlreadyAttacked(current_grid)) return;
        let block_ref = this.#board[current_grid[0]][current_grid[1]];

        this.#attackedblocks.push(current_grid);
        if (block_ref != null){
            block_ref.hit();
            if (block_ref.isSunk()) this.#shipCountRemaining--;
        }
    }
}

export { Ship, Gameboard };