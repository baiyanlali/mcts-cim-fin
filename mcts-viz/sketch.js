/// <reference path="./lib/p5.global-mode.d.ts" />

// let TTT_BOARD;
// let canvas;
//
// var this.whoseTurn;
// var this.hoveredTile = -1;
// var this.tileSize;
//
// var this.whoseTurnSpan;
// var this.machineControlsArea;
// var this.whoseturnArea;
// var this.startingPlayerArea;
// var this.gameOverArea;
// var this.gameOverWinner;
// var this.mctsTimeoutSlider;
// var this.mctsTimeoutSpan;

const GameStates = Object.freeze({ 
    SELECT_STARTING_PLAYER: 0, 
    WAITING_HUMAN_MOVE: 1,
    WAITING_MACHINE_MOVE: 2,
    GAME_OVER: 3,
    RUNNING_VIS: 4
});
var currentGameState;

const s = (sketch) => {

    sketch.preload = ()=>{
        sketch.circle = sketch.loadImage("image/tic-tac-toe/circle1.png")
        sketch.cross = sketch.loadImage("image/tic-tac-toe/cross1.png")
    }

  sketch.setup = () => {
    sketch.canvas = sketch.createCanvas(200, 200);
    sketch.tileSize = (sketch.width - 20)/3;
    let canvas_id = sketch._userNode.id
    // console.log(canvas_id)
    sketch.whoseTurnSpan = sketch.select("#"+canvas_id+"_"+"whoseturn");
    sketch.machineControlsArea = sketch.select("#"+canvas_id+"_"+"machine_controls_area");
    sketch.whoseturnArea = sketch.select("#"+canvas_id+"_"+"whoseturn_area");
    sketch.startingPlayerArea = sketch.select("#"+canvas_id+"_"+"starting_player_area");
    sketch.gameOverArea = sketch.select("#"+canvas_id+"_"+"game_over_area");
    sketch.gameOverWinner = sketch.select("#"+canvas_id+"_"+"game_over_winner");
    sketch.mctsTimeoutSlider = sketch.select("#"+canvas_id+"_"+"mcts_timeout_slider");
    sketch.mctsTimeoutSpan = sketch.select("#"+canvas_id+"_"+"mcts_timeout_span");
    //
    sketch.reset();
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

      if(sketch.onMakeMove!==null)
          sketch.onMakeMove(sketch)
  }

  sketch.drawBoard = () => {
        sketch.translate(10, 10);

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                let tile = sketch.TTT_BOARD.grid[j + i*3];
                let draw_tile = null
                if (sketch.hoveredTile == (j + i*3) && currentGameState == GameStates.WAITING_HUMAN_MOVE
                    && sketch.TTT_BOARD.isLegalPosition(j + i*3)) {
                    sketch.fill(200, 200, 200);
                } else if (tile == "h") {
                    // sketch.fill(100, 100, 240);
                    sketch.fill("#00cec9")
                    draw_tile = sketch.cross
                } else if (tile == "m") {
                    sketch.fill("#fab1a0")
                    draw_tile = sketch.circle
                    // sketch.fill(240, 100, 100);
                } else {
                    // sketch.fill(255, 255, 255);
                    sketch.fill("#dfe6e9");
                }

                sketch.rect(j * sketch.tileSize, i * sketch.tileSize, sketch.tileSize, sketch.tileSize);

                if(draw_tile!==null)
                    sketch.image(draw_tile, j * sketch.tileSize, i *  sketch.tileSize,  sketch.tileSize,  sketch.tileSize)


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
                sketch.machineControlsArea.show();
                break;
            case GameStates.RUNNING_VIS:
                sketch.machineControlsArea.hide();
                break;
            case GameStates.GAME_OVER:
                sketch.gameOverArea.show();
                let winner = sketch.TTT_BOARD.checkWin();
                switch (winner) {
                    case "h": winner = "HUMAN"; break;
                    case "m": winner = "MACHINE"; break;
                    case "v": winner = "DRAW"; break;
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
                if (mouseX > (j * sketch.tileSize) && mouseX < ((j+1) * sketch.tileSize)
                    && mouseY > (i * sketch.tileSize) && mouseY < ((i+1) * sketch.tileSize)) {
                    sketch.hoveredTile = j + i*3;
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

    sketch.flip_player=(player)=>{
      if(player===PLAYER.HUMAN){
          return PLAYER.MACHINE
      }
      return PLAYER.HUMAN
    }

    sketch.random_board = (min_step = 0, max_step = 8) => {
        sketch.TTT_BOARD = new TicTacToeBoard()
        sketch.whoseTurn = sketch.round(sketch.random(0, 1))
        sketch.selectStartingPlayer(sketch.whoseTurn)
        let steps = Math.floor((Math.random()*(max_step+1)))
        let tmp_board = sketch.TTT_BOARD.copy()
        for (let i = 0; i < steps; i++) {
            tmp_board.makeRandomMove(sketch.whoseTurn)
            if(tmp_board.checkWin()!==""){
                break
            }
            sketch.whoseTurn = sketch.flip_player(sketch.whoseTurn)
            sketch.TTT_BOARD = tmp_board.copy()
        }
    }

    sketch.machineRandomMove = () => {
        sketch.TTT_BOARD.makeRandomMove(PLAYER.MACHINE);

        if(sketch.onMakeMove!==null)
            sketch.onMakeMove(sketch)

        sketch.endMove(PLAYER.MACHINE);
    }

    sketch.makeMctsMove = (interactive) => {
        let monteCarlo = new MCTS(sketch.TTT_BOARD.copy(), sketch.whoseTurn);
        let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value());
        if(interactive!==undefined && interactive!==null){
            interactive.setMCTS(monteCarlo, MCTS_search)
            sketch.stateTransition(GameStates.RUNNING_VIS)
            sketch.whoseturnArea.show();
            sketch.whoseTurnSpan.html(sketch.whoseTurn == PLAYER.HUMAN ? "HUMAN" : "MACHINE");
        }else{
            sketch.makeMove(MCTS_search.move)
            sketch.endMove(MCTS_search.move.player)
        }

    }

    sketch.machineMctsMove = (interactive) => {
        let monteCarlo = new MCTS(sketch.TTT_BOARD.copy(), PLAYER.MACHINE);
        let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value());
        if(interactive!==undefined && interactive!==null){
            interactive.setMCTS(monteCarlo, MCTS_search)
            sketch.stateTransition(GameStates.RUNNING_VIS)
        }else{
            sketch.makeMove(MCTS_search.move)
            sketch.endMove(MCTS_search.move.player)
        }

    }

    sketch.machineGreedyMove = () =>{
      sketch.TTT_BOARD.makeGreedyMove(PLAYER.MACHINE);

        if(sketch.onMakeMove!==null)
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
        sketch.TTT_BOARD.makeMove(move);
        if(sketch.onMakeMove!==null)
            sketch.onMakeMove(sketch)
    }
};


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

        if (i % 10 == 0) { console.log("i: " + i); };
        results[board.checkWin()] += 1;
    }

    console.log(results);
}