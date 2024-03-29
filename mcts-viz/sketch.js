export const GameStates = Object.freeze({
    SELECT_STARTING_PLAYER: 0,
    WAITING_HUMAN_MOVE: 1,
    WAITING_MACHINE_MOVE: 2,
    GAME_OVER: 3,
    RUNNING_VIS: 4
});

export var currentGameState;

export const s = (sketch) => {

    sketch.onLoad = null

    sketch.preload = () => {
        sketch.circle = sketch.loadImage("image/tic-tac-toe/circle1.png")
        sketch.cross = sketch.loadImage("image/tic-tac-toe/cross1.png")
    }

    sketch.setup = () => {
        sketch.canvas = sketch.createCanvas(200, 200);
        sketch.tileSize = (sketch.width - 20) / 3;
        let canvas_id = sketch._userNode.id
        // console.log(canvas_id)
        sketch.whoseTurnSpan = sketch.select("#" + canvas_id + "_" + "whoseturn");
        sketch.machineControlsArea = sketch.select("#" + canvas_id + "_" + "machine_controls_area");
        sketch.whoseturnArea = sketch.select("#" + canvas_id + "_" + "whoseturn_area");
        sketch.startingPlayerArea = sketch.select("#" + canvas_id + "_" + "starting_player_area");
        sketch.gameOverArea = sketch.select("#" + canvas_id + "_" + "game_over_area");
        sketch.gameOverWinner = sketch.select("#" + canvas_id + "_" + "game_over_winner");
        sketch.mctsTimeoutSlider = sketch.select("#" + canvas_id + "_" + "mcts_timeout_slider");
        sketch.mctsTimeoutSpan = sketch.select("#" + canvas_id + "_" + "mcts_timeout_span");
        //
        sketch.reset();
        if (sketch.onLoad)
            sketch.onLoad(sketch)
    };

    sketch.draw = () => {
        sketch.handleHover();
        sketch.drawBoard();

        sketch.mctsTimeoutSpan.html(sketch.mctsTimeoutSlider.value());
    };

    sketch.reset = () => {
        sketch.TTT_BOARD = new TicTacToeBoard();
        sketch.whoseTurn = sketch.round(sketch.random(0, 1));
        sketch.stateTransition(GameStates.SELECT_STARTING_PLAYER);

        if (sketch.onMakeMove !== null)
            sketch.onMakeMove(sketch)
    }

    sketch.drawBoard = () => {
        sketch.translate(10, 10);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let isFake = false;

                let tile = sketch.TTT_BOARD.grid[j + i * 3];
                let draw_tile = null
                if (sketch.hoveredTile === (j + i * 3) && currentGameState === GameStates.WAITING_HUMAN_MOVE
                    && sketch.TTT_BOARD.isLegalPosition(j + i * 3)) {
                    sketch.fill(200, 200, 200);
                } else if (tile === "h") {
                    // sketch.fill(100, 100, 240);
                    sketch.fill("#00cec9")
                    draw_tile = sketch.cross
                } else if (tile === "m") {
                    sketch.fill("#fab1a0")
                    draw_tile = sketch.circle
                    // sketch.fill(240, 100, 100);
                } else if (tile === "fh") {
                    // sketch.fill("#0095ff")
                    sketch.fill("#dfe6e9");
                    draw_tile = sketch.cross
                    isFake = true
                } else if (tile === "fm") {
                    // sketch.fill("#d00b0b")
                    sketch.fill("#dfe6e9");
                    draw_tile = sketch.circle
                    isFake = true
                } else {
                    // sketch.fill(255, 255, 255);
                    sketch.fill("#dfe6e9");
                }


                sketch.rect(j * sketch.tileSize, i * sketch.tileSize, sketch.tileSize, sketch.tileSize);

                if (draw_tile !== null) {
                    sketch.push()
                    if (isFake)
                        sketch.tint(255, 255, 255, 128);
                    else
                        sketch.tint(255, 255, 255, 255);
                    sketch.image(draw_tile, j * sketch.tileSize, i * sketch.tileSize, sketch.tileSize, sketch.tileSize)
                    sketch.pop()
                }

                sketch.tint(255, 255, 255, 255)
            }
        }
    }

    sketch.disableEverythingHTML = () => {
        sketch.startingPlayerArea.hide();
        sketch.whoseturnArea.hide();
        sketch.machineControlsArea.hide();
        sketch.gameOverArea.hide();
    }

    sketch.stateTransition = (newGameState) => {
        sketch.disableEverythingHTML();

        switch (newGameState) {
            case GameStates.SELECT_STARTING_PLAYER:
                sketch.startingPlayerArea.show();
                break;
            case GameStates.WAITING_HUMAN_MOVE:
                sketch.whoseTurn = PLAYER.HUMAN;
                sketch.whoseturnArea.show();
                sketch.whoseTurnSpan.html(sketch.whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
                break;
            case GameStates.WAITING_MACHINE_MOVE:
                sketch.whoseTurn = PLAYER.MACHINE;
                sketch.whoseturnArea.show();
                sketch.whoseTurnSpan.html(sketch.whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
                // sketch.machineControlsArea.style.display = "flex"
                sketch.machineControlsArea.show()
                sketch.machineControlsArea.style('display', 'flex');
                break;
            case GameStates.RUNNING_VIS:
                sketch.machineControlsArea.hide();
                break;
            case GameStates.GAME_OVER:
                sketch.gameOverArea.show();
                let winner = sketch.TTT_BOARD.checkWin();
                switch (winner) {
                    case "h":
                        winner = "HUMAN";
                        break;
                    case "m":
                        winner = "MACHINE";
                        break;
                    case "v":
                        winner = "DRAW";
                        break;
                }
                sketch.gameOverWinner.html(winner);
                break;
        }

        currentGameState = newGameState;
    }

    sketch.handleHover = () => {
        let mouseX = sketch.mouseX;
        let mouseY = sketch.mouseY;

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (mouseX > (j * sketch.tileSize) && mouseX < ((j + 1) * sketch.tileSize)
                    && mouseY > (i * sketch.tileSize) && mouseY < ((i + 1) * sketch.tileSize)) {
                    sketch.hoveredTile = j + i * 3;
                    return;
                }
            }
        }

        sketch.hoveredTile = -1;
    }

    sketch.selectStartingPlayer = (player) => {
        sketch.whoseTurn = player;
        sketch.stateTransition(
            sketch.whoseTurn == PLAYER.HUMAN ?
                GameStates.WAITING_HUMAN_MOVE :
                GameStates.WAITING_MACHINE_MOVE);
    }

    sketch.mouseClicked = () => {
        if (sketch.hoveredTile != -1 && sketch.whoseTurn == PLAYER.HUMAN && sketch.TTT_BOARD.isLegalPosition(sketch.hoveredTile)) {
            sketch.TTT_BOARD.humanMakeMove(sketch.hoveredTile);
            sketch.endMove(PLAYER.HUMAN);
        }
    }

    sketch.flip_player = (player) => {
        if (player === PLAYER.HUMAN) {
            return PLAYER.MACHINE
        }
        return PLAYER.HUMAN
    }

    sketch.random_board = (min_step = 0, max_step = 8) => {
        sketch.TTT_BOARD = new TicTacToeBoard()
        sketch.whoseTurn = sketch.round(sketch.random(0, 1))
        sketch.selectStartingPlayer(sketch.whoseTurn)
        let steps = Math.floor((Math.random() * (max_step - min_step + 1))) + min_step
        let tmp_board = sketch.TTT_BOARD.copy()
        for (let i = 0; i < steps; i++) {
            tmp_board.makeRandomMove(sketch.whoseTurn)
            if (tmp_board.checkWin() !== "") {
                break
            }
            sketch.whoseTurn = sketch.flip_player(sketch.whoseTurn)
            sketch.TTT_BOARD = tmp_board.copy()
        }
    }

    sketch.machineRandomMove = () => {
        sketch.TTT_BOARD.makeRandomMove(PLAYER.MACHINE);

        if (sketch.onMakeMove !== null)
            sketch.onMakeMove(sketch)

        sketch.endMove(PLAYER.MACHINE);
    }

    sketch.makeSimulationMove = (interactive) => {
        let monteCarlo = new MCTSSimulation(sketch.TTT_BOARD.copy(), sketch.whoseTurn);
        let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value());
        if (interactive !== undefined && interactive !== null) {
            interactive.setMCTS(monteCarlo, MCTS_search)
            sketch.stateTransition(GameStates.RUNNING_VIS)
            sketch.whoseturnArea.show();
            // sketch.whoseTurnSpan.html(sketch.whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
            // interactive.clickVisualizeSimulationLastStep()
        } else {
            sketch.makeMove(MCTS_search.move)
            sketch.endMove(MCTS_search.move.player)
        }
    }

    sketch.makeMctsMove = (interactive) => {
        let monteCarlo = new MCTS(sketch.TTT_BOARD.copy(), sketch.whoseTurn);
        let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value());
        if (interactive !== undefined && interactive !== null) {
            interactive.setMCTS(monteCarlo, MCTS_search)
            sketch.stateTransition(GameStates.RUNNING_VIS)
            sketch.whoseturnArea.show();
            // sketch.whoseTurnSpan.html(sketch.whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
        } else {
            sketch.makeMove(MCTS_search.move)
            sketch.endMove(MCTS_search.move.player)
        }
    }

    sketch.machineMctsMove = (interactive) => {
        let monteCarlo = new MCTS(sketch.TTT_BOARD.copy(), PLAYER.MACHINE);
        let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value());
        if (interactive !== undefined && interactive !== null) {
            interactive.setMCTS(monteCarlo, MCTS_search)
            sketch.stateTransition(GameStates.RUNNING_VIS)
        } else {
            sketch.makeMove(MCTS_search.move)
            sketch.endMove(MCTS_search.move.player)
        }

    }

    sketch.machineGreedyMove = () => {
        sketch.TTT_BOARD.makeGreedyMove(PLAYER.MACHINE);

        if (sketch.onMakeMove !== null)
            sketch.onMakeMove(sketch)

        sketch.endMove(PLAYER.MACHINE);
    }

    sketch.endMove = (player) => {
        if (sketch.TTT_BOARD.checkWin() !== "") {
            sketch.stateTransition(GameStates.GAME_OVER);
        } else {
            sketch.stateTransition(player === PLAYER.HUMAN ?
                GameStates.WAITING_MACHINE_MOVE :
                GameStates.WAITING_HUMAN_MOVE);
        }
    }

    sketch.onMakeMove = null

    sketch.makeMove = (move) => {
        sketch.TTT_BOARD.makeMove(move)
        if (sketch.onMakeMove !== null)
            sketch.onMakeMove(sketch)
    }

    sketch.makeFakeMove = (move) => {
        sketch.TTT_BOARD.makeFakeMove(move)
        if (sketch.onMakeMove !== null)
            sketch.onMakeMove(sketch)
    }
};


const Position = {
    3: "A",
    6: "B",
    5: "D",
    7: "C"
}

export const sTest = (st) => {
    s(st)

    st.drawBoard = () => {
        st.translate(10, 10);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let isFake = false;

                let tile = st.TTT_BOARD.grid[j + i * 3];
                let draw_tile = null
                if (st.hoveredTile === (j + i * 3) && currentGameState === GameStates.WAITING_HUMAN_MOVE
                    && st.TTT_BOARD.isLegalPosition(j + i * 3)) {
                    st.fill(200, 200, 200);
                } else if (tile === "h") {
                    // st.fill(100, 100, 240);
                    st.fill("#00cec9")
                    draw_tile = st.cross
                } else if (tile === "m") {
                    st.fill("#fab1a0")
                    draw_tile = st.circle
                    // st.fill(240, 100, 100);
                } else if (tile === "fh") {
                    // st.fill("#0095ff")
                    st.fill("#dfe6e9");
                    draw_tile = st.cross
                    isFake = true
                } else if (tile === "fm") {
                    // st.fill("#d00b0b")
                    st.fill("#dfe6e9");
                    draw_tile = st.circle
                    isFake = true
                } else {
                    // st.fill(255, 255, 255);
                    st.fill("#dfe6e9");
                }


                st.rect(j * st.tileSize, i * st.tileSize, st.tileSize, st.tileSize);

                let pos_cha = Position[j + i * 3]
                if(pos_cha!== undefined ){
                    st.fill(0);
                    st.textSize(30);
                    st.textAlign(st.CENTER, st.CENTER);
                    st.text(pos_cha, j * st.tileSize + st.tileSize/2, i * st.tileSize + st.tileSize/2);
                }

                if (draw_tile !== null) {
                    st.push()
                    if (isFake)
                        st.tint(255, 255, 255, 128);
                    else
                        st.tint(255, 255, 255, 255);
                    st.image(draw_tile, j * st.tileSize, i * st.tileSize, st.tileSize, st.tileSize)
                    st.pop()
                }

                st.tint(255, 255, 255, 255)
            }
        }
    }
}

function testMCTS() {
    let results = {"h": 0, "m": 0, "v": 0};
    for (var i = 0; i < 100; i++) {
        let board = new TicTacToeBoard();

        let player = myp5.int(myp5.random(2)) % 2 == 1 ? PLAYER.MACHINE : PLAYER.HUMAN;
        while (board.checkWin() == "") {
            if (player == PLAYER.MACHINE) {
                let mcts_model = new MCTS(board.copy(), player);
                let mcts_search = mcts_model.runSearch(0.4);

                board.makeMove(mcts_search.move);
            } else {
                board.makeRandomMove(player);
            }

            // board.print();

            player = player == PLAYER.MACHINE ? PLAYER.HUMAN : PLAYER.MACHINE;
        }

        if (i % 10 == 0) {
            console.log("i: " + i);
        }
        ;
        results[board.checkWin()] += 1;
    }

    console.log(results);
}