const PLAYER = Object.freeze({HUMAN: 0, MACHINE: 1});

class TicTacToeBoard {
    constructor() {
        this.grid = (new Array(9)).fill("");
    }

    humanMakeMove(position) {
        if (this.getLegalPositions().indexOf(position) == -1) {
            console.error("Illegal move! Legal moves: " + this.getLegalPositions().toString());
            return;
        }

        this.makeMove(new GameMove(PLAYER.HUMAN, position));
    }

    makeRandomMove(player) {
        let legalMoves = this.getLegalPositions();
        let randomMove = myp5.round(myp5.random(legalMoves.length - 1));
        let position = legalMoves[randomMove];
        this.makeMove(new GameMove(player, position));
    }

    makeMove(move) {
        this.grid[move.position] = (move.player == PLAYER.HUMAN) ? "h" : "m";
    }

    makeFakeMove(move) {
        this.grid[move.position] = (move.player === PLAYER.HUMAN) ? "fh" : "fm";
    }

    makeGreedyMove(player) {
        let legalMoves = this.getLegalPositions();

        let max_eval = 0
        let max_idx = 0

        for (let i = 0; i < legalMoves.length; i++) {
            let new_board = this.copy()
            new_board.makeMove(new GameMove(player, legalMoves[i]))
            let new_eval = new_board.evalBoard(player)
            // console.log("pos: "+legalMoves[i]+" eval: "+new_eval)
            if (new_eval > max_eval) {
                max_idx = i
                max_eval = new_eval
            }
        }

        // console.log("best move: "+legalMoves[max_idx])

        this.makeMove(new GameMove(player, legalMoves[max_idx]))
    }

    //very ugly
    evalBoard(player) {
        let score = 0;
        let c = (player === PLAYER.HUMAN) ? "h" : "m";
        let e = (player === PLAYER.HUMAN) ? "m" : "h";//opponent
        score += areEqual([this.grid[0 + 0], this.grid[1 + 0], c]) ? 1 : 0;
        score += areEqual([this.grid[2 + 0], this.grid[1 + 0], c]) ? 1 : 0;

        score += areEqual([this.grid[0 + 3], this.grid[1 + 3], c]) ? 1 : 0;
        score += areEqual([this.grid[2 + 3], this.grid[1 + 3], c]) ? 1 : 0;

        score += areEqual([this.grid[0 + 6], this.grid[1 + 6], c]) ? 1 : 0;
        score += areEqual([this.grid[2 + 6], this.grid[1 + 6], c]) ? 1 : 0;

        score += areEqual([this.grid[0 + 0], this.grid[0 + 3], c]) ? 1 : 0;
        score += areEqual([this.grid[0 + 3], this.grid[0 + 6], c]) ? 1 : 0;

        score += areEqual([this.grid[1 + 0], this.grid[1 + 3], c]) ? 1 : 0;
        score += areEqual([this.grid[1 + 3], this.grid[1 + 6], c]) ? 1 : 0;

        score += areEqual([this.grid[2 + 0], this.grid[2 + 3], c]) ? 1 : 0;
        score += areEqual([this.grid[2 + 3], this.grid[2 + 6], c]) ? 1 : 0;

        score += areEqual([this.grid[0], this.grid[4], c]) ? 1 : 0;
        score += areEqual([this.grid[4], this.grid[8], c]) ? 1 : 0;


        score += areEqual([this.grid[2], this.grid[4], c]) ? 1 : 0;
        score += areEqual([this.grid[4], this.grid[6], c]) ? 1 : 0;

        score += areEqual([this.grid[0 + 0], this.grid[1 + 0], e]) && areEqual([this.grid[2 + 0], c]) ? 2 : 0;
        score += areEqual([this.grid[2 + 0], this.grid[1 + 0], e]) && areEqual([this.grid[0 + 0], c]) ? 2 : 0;

        score += areEqual([this.grid[0 + 3], this.grid[1 + 3], e]) && areEqual([this.grid[2 + 3], c]) ? 2 : 0;
        score += areEqual([this.grid[2 + 3], this.grid[1 + 3], e]) && areEqual([this.grid[0 + 3], c]) ? 2 : 0;

        score += areEqual([this.grid[0 + 6], this.grid[1 + 6], e]) && areEqual([this.grid[2 + 6], c]) ? 2 : 0;
        score += areEqual([this.grid[2 + 6], this.grid[1 + 6], e]) && areEqual([this.grid[0 + 6], c]) ? 2 : 0;


        score += areEqual([this.grid[0 + 0], this.grid[0 + 3], e]) && areEqual([this.grid[0 + 6], c]) ? 2 : 0;
        score += areEqual([this.grid[0 + 6], this.grid[0 + 3], e]) && areEqual([this.grid[0 + 0], c]) ? 2 : 0;

        score += areEqual([this.grid[1 + 0], this.grid[1 + 3], e]) && areEqual([this.grid[1 + 6], c]) ? 2 : 0;
        score += areEqual([this.grid[1 + 6], this.grid[1 + 3], e]) && areEqual([this.grid[1 + 0], c]) ? 2 : 0;

        score += areEqual([this.grid[2 + 0], this.grid[2 + 3], e]) && areEqual([this.grid[2 + 6], c]) ? 2 : 0;
        score += areEqual([this.grid[2 + 6], this.grid[2 + 3], e]) && areEqual([this.grid[2 + 0], c]) ? 2 : 0;

        score += areEqual([this.grid[0], this.grid[4], e]) && areEqual([this.grid[8], c]) ? 2 : 0;
        score += areEqual([this.grid[4], this.grid[8], e]) && areEqual([this.grid[0], c]) ? 2 : 0;

        score += areEqual([this.grid[2], this.grid[4], e]) && areEqual([this.grid[6], c]) ? 2 : 0;
        score += areEqual([this.grid[4], this.grid[6], e]) && areEqual([this.grid[2], c]) ? 2 : 0;


        score += areEqual([this.grid[0 + 0], this.grid[1 + 0], this.grid[2 + 0], c]) ? 100 : 0;
        score += areEqual([this.grid[0 + 3], this.grid[1 + 3], this.grid[2 + 3], c]) ? 100 : 0;
        score += areEqual([this.grid[0 + 6], this.grid[1 + 6], this.grid[2 + 6], c]) ? 100 : 0;
        score += areEqual([this.grid[0 + 0], this.grid[3 + 0], this.grid[6 + 0], c]) ? 100 : 0;
        score += areEqual([this.grid[0 + 1], this.grid[3 + 1], this.grid[6 + 1], c]) ? 100 : 0;
        score += areEqual([this.grid[0 + 2], this.grid[3 + 2], this.grid[6 + 2], c]) ? 100 : 0;
        score += areEqual([this.grid[0], this.grid[4], this.grid[8], c]) ? 100 : 0;
        score += areEqual([this.grid[2], this.grid[4], this.grid[6], c]) ? 100 : 0;

        return score;
        // return this.grid.filter((i)=>{return (player === PLAYER.HUMAN && i === "h")||(player === PLAYER.MACHINE && i === "m")}).length;
    }

    getLegalPositions() {
        return this.grid.map((f, i) => [f, i]).filter((f) => f[0] == "").map((f) => f[1]);
    }

    hasLegalPositions() {
        return this.getLegalPositions().length > 0;
    }

    isLegalPosition(position) {
        return this.getLegalPositions().find((f) => f == position) != undefined;
    }

    checkWin() {
        if (areEqual([this.grid[0 + 0], this.grid[1 + 0], this.grid[2 + 0]])) if (this.grid[0 + 0] !== "") return this.grid[0 + 0];
        if (areEqual([this.grid[0 + 3], this.grid[1 + 3], this.grid[2 + 3]])) if (this.grid[0 + 3] !== "") return this.grid[0 + 3];
        if (areEqual([this.grid[0 + 6], this.grid[1 + 6], this.grid[2 + 6]])) if (this.grid[0 + 6] !== "") return this.grid[0 + 6];

        if (areEqual([this.grid[0 + 0], this.grid[3 + 0], this.grid[6 + 0]])) if (this.grid[0 + 0] !== "") return this.grid[0 + 0];
        if (areEqual([this.grid[0 + 1], this.grid[3 + 1], this.grid[6 + 1]])) if (this.grid[0 + 1] !== "") return this.grid[0 + 1];
        if (areEqual([this.grid[0 + 2], this.grid[3 + 2], this.grid[6 + 2]])) if (this.grid[0 + 2] !== "") return this.grid[0 + 2];

        if (areEqual([this.grid[0], this.grid[4], this.grid[8]])) if (this.grid[4] !== "") return this.grid[4];
        if (areEqual([this.grid[2], this.grid[4], this.grid[6]])) if (this.grid[4] !== "") return this.grid[4];

        if (!this.hasLegalPositions()) return "v";

        return "";
    }

    print() {
        let string = "";
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                let tile = this.grid[i * 3 + j];

                string += " " + (i * 3 + j).toString() + ": ";
                string += (tile == "") ? "_" : tile;
                string += " ";
                string += (j == 2 ? "" : "|");
            }
            string += (i == 2 ? "" : "\n------------------\n");
        }

        console.log(string);
    }

    copy() {
        let board = new TicTacToeBoard();
        board.grid = this.grid.slice();
        return board;
    }
}

class GameMove {
    constructor(player, position) {
        this.player = player;
        this.position = position;
    }

    copy() {
        return new GameMove(this.player, this.position);
    }
}

function areEqual(arr) {
    return arr.find((f) => f != arr[0]) == undefined;
}