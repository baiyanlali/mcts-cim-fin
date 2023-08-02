import Go, {GoTile} from "./go.js";
import GoMCTS from "./go_mcts.js";


export const sketch_go = (s) => {

    s.preload = () => {
    }

    s.hasSetup = false

    s.onSetup = null
    s.onSetupParams = null

    s.hoveredTile = [-1, -1]

    s.lastBoard = null

    s.go = null

    s.onMouseClicked = (tile) => {
    }

    s.setup = () => {
        s.canvas = s.createCanvas(200, 200)
        s.clear()
        s.hasSetup = true
        /*s.button = s.createButton('pass')
        s.button.position(0, 0, 'relative')
        s.button.mousePressed(()=>{
            if(!s.go)return
            console.log("button!")
            s.go.make_action(-1)
        })*/
        if (s.onSetup !== null) {
            s.onSetup(s.onSetupParams[0])
        }
    }

    s.draw = () => {
        s.handleHover()
        s.drawBoard(null)
    }

    s.drawBoard = (board) => {

        if (s.hasSetup === false) {
            s.onSetup = s.drawBoard
            s.onSetupParams = [board]
            return
        }
        s.push()

        s.translate(15, 15);

        if (board)
            s.lastBoard = board
        else
            board = s.lastBoard

        let tileNum = Math.max(board.length, board[0].length)
        s.tileSize = (s.width - 20) / tileNum;
        s.clear()


        s.strokeWeight(1.5)

        //draw the base board

        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
                if (i !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, (i + 1) * s.tileSize, j * s.tileSize)
                if (j !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, i * s.tileSize, (j + 1) * s.tileSize)
                let radius = 4

                switch (board[i][j]) {
                    case GoTile.Empty:
                        s.fill(0)
                        if (i === s.hoveredTile[0] && j === s.hoveredTile[1]) {
                            s.fill(122)
                            radius = 15
                        }
                        break;
                    case GoTile.Black:
                        s.fill(0)
                        radius = 20
                        break;
                    case GoTile.White:
                        s.fill(255)
                        radius = 20
                        break;
                }
                s.circle(i * s.tileSize, j * s.tileSize, radius)
            }
        }

        s.pop()

        if (s.go === null) return

        if (s.go.end) {
            s.text(`Winner is: ${s.go.winner === 999 ? "Draw" : s.go.winner === GoTile.White ? "White" : "Black"}`, 15, 190)
        } else {
            s.text(`Current Player: ${s.go.current_player() === GoTile.White ? "White" : "Black"}`, 15, 190)
        }
    }

    s.mouseClicked = () => {
        s.onMouseClicked(s.hoveredTile)
    }


    s.handleHover = () => {
        let mouseX = s.mouseX;
        let mouseY = s.mouseY;
        let tileNum = 7

        for (var i = 0; i < tileNum; i++) {
            for (var j = 0; j < tileNum; j++) {
                if (mouseX > (i * s.tileSize) && mouseX < ((i + 1) * s.tileSize)
                    && mouseY > (j * s.tileSize) && mouseY < ((j + 1) * s.tileSize)) {
                    s.hoveredTile = [i, j];
                    return;
                }
            }
        }

        s.hoveredTile = [-1, -1];
    }


}

export default class GoGame {
    screen;
    screendiv;
    that;

    constructor(screenID = "", board = undefined) {
        this.goGame = new p5(sketch_go, screenID + "p5_go")

        this.goGame.onMouseClicked = (tile) => {
            if (tile === [-1, -1]) return
            this.makeAction(new GameMove(this.go.current_player(), tile))
        }
        // console.log(screenID+"p5_game")
        this.that = this
        this.screenID = screenID
        this.screen = screenID + "gogame"
        this.screendiv = screenID + "gogamediv"
        this.go = new Go(board)

        this.goGame.go = this.go
        this.div = document.getElementById(this.screendiv)


        this.div.onmouseover = () => {
            this.onMouseOver()
        }
        this.div.onmouseout = () => {
            window.onkeydown = () => {
            }
        }

        this.onMakeAction = null

        this.step = 0
        this.cancel = false

        this.show_board()
    }

    set_board(board) {
        this.go.board = Array.from({length: board.length}, () => new Array(board[0].length).fill(GoTile.Empty))
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                this.go.board[i][j] = board[i][j]
            }
        }
    }


    init(board = undefined) {
        // await sleep(100)
        document.getElementById(this.screen + "_reset").style.display = "none"
        this.go = new Go(board)
        this.show_board(this.go.board)
        this.machineControlsArea = document.getElementById(this.screen + "_" + "machine_controls_area");
        this.cancel = false
        this.goGame.go = this.go
    }

    onMouseOver() {
        // this.goGame.handleHover()
    }

    makeMove(action) {
        this.makeAction(action)
    }


    makeAction(action) {
        this.go.make_action(action, () => {
            this.step++
        })
        this.show_board()
        if (this.onMakeAction !== null)
            this.onMakeAction(this)
        if (this.go.checkWin()) {
            // document.getElementById(this.screen).innerHTML +=
            //     "<br>Clear!<br>" +
            //     "<button id="+this.screen+"_reset type='submit'>Reset</button>"
            // document.getElementById(this.screen+"_reset").onclick = ()=>{this.init()}
            this.show_result()
        }

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = ""
    }

    show_board() {
        // document.getElementById(this.screen).innerHTML = this.print_board()
        this.goGame.drawBoard(this.go.board)
    }

    show_result = () => {
        document.getElementById(this.screen + "_reset").style.display = ""
        $('#' + this.screen + '_step').text(this.step)
        this.step = 0
    }

    machineRandomMove = () => {
        this.go.makeRandomMove()

        this.show_board();

        if (this.go.checkWin()) {
            this.show_result()
        }
    }

    pass = () => {
        this.go.make_action({position: -1})
    }

    makeMctsMove = (interactive) => {
        let monteCarlo = new GoMCTS(this.go)
        // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
        let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())
        interactive.setMCTS(monteCarlo, MCTS_search)

        // interactive.clickVisualizeLastStep()

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = "none"

        this.makeMove(MCTS_search.move)
        // this.endMove(MCTS_search.move.player)
    }

    machineMctsMove = async (interactive) => {
        let monteCarlo = new GoMCTS(this.go)
        // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
        let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = "none"

        MCTS_search.then((r)=>{
            interactive.setMCTS(monteCarlo, r)
        })

        // interactive.setMCTS(monteCarlo, MCTS_search)
    }

    // machineMctsMoveWithMyMCTS = (interactive, MyMCTS) => {
    //     let monteCarlo = new MyMCTS(this.go)
    //     // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
    //     let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())
    //
    //     if (this.machineControlsArea)
    //         this.machineControlsArea.style.display = "none"
    //
    //     interactive.setMCTS(monteCarlo, MCTS_search)
    // }

    cancelPlay = () => {
        this.cancel = true
    }

    autoPlay = async (interactive) => {
        document.getElementById("go_cancel").style.display = ""
        document.getElementById("go_autoplay").style.display = "none"
        document.getElementById("go_reset").disabled = true
        document.getElementById("go_mcts_move").disabled = true
        document.getElementById("go_rand_move").disabled = true

        while (!this.go.checkWin() && this.cancel === false) {
            this.makeMctsMove(interactive)
            await sleep(100)
        }
        document.getElementById("go_cancel").style.display = "none"
        document.getElementById("go_autoplay").style.display = ""
        document.getElementById("go_reset").disabled = false
        document.getElementById("go_mcts_move").disabled = false
        document.getElementById("go_rand_move").disabled = false
        this.cancel = false
    }


}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


