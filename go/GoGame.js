import Go, {GoTile} from "./go.js";


export const sketch_go = (s) => {

    s.preload = () => {
        //
        // s.box = s.loadImage('image/sokoban/Box.png')
        // s.destination = s.loadImage('image/sokoban/Destination.png')
        // s.player = s.loadImage('image/sokoban/Player.png')
        // s.wall = s.loadImage('image/sokoban/Wall.png')
        // s.boxEnd = s.loadImage('image/sokoban/BoxEnd.png')
    }

    s.hasSetup = false

    s.onSetup = null
    s.onSetupParams = null

    s.hoveredTile = [-1, -1]

    s.setup = () => {
        s.canvas = s.createCanvas(200, 200)
        s.clear()
        s.hasSetup = true

        if (s.onSetup !== null) {
            s.onSetup(s.onSetupParams[0], s.onSetupParams[1])
        }
    }

    s.draw = () => {
        s.handleHover()
        s.drawBoard([
            [GoTile.Black, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.White]
        ])
    }

    s.drawBoard = (board) => {
        s.translate(10, 10);

        if (s.hasSetup === false) {
            s.onSetup = s.drawBoard
            s.onSetupParams = [board]
            return
        }

        let tileNum = Math.max(board.length, board[0].length)
        s.tileSize = (s.width - 20) / tileNum;
        s.clear()

        s.push()

        s.strokeWeight(1.5)

        //draw the base board

        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
                if(i!== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, (i + 1) * s.tileSize, j * s.tileSize)
                if(j!== tileNum - 1)   
                    s.line(i * s.tileSize, j * s.tileSize, i * s.tileSize, (j + 1) * s.tileSize)
                let radius = 4

                switch(board[i][j]){
                    case GoTile.Empty:
                        s.fill(0)
                        if(i == s.hoveredTile[0] && j == s.hoveredTile[1]){
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


    }

    s.mouseClicked = ()=>{
        
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
        this.sokobanGame = new p5(sketch_sokoban, screenID + "p5_game")
        // console.log(screenID+"p5_game")
        this.that = this;
        this.screenID = screenID;
        this.screen = screenID + "sokobangame"
        this.screendiv = screenID + "sokobangamediv"
        this.sokoban = new Sokoban(board)
        // this.show_board(this.sokoban.board)
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
    }

    set_board(board) {

        this.sokoban.board = Array.from({length: board.length}, () => new Array(board[0].length).fill(SokobanTile.Empty))
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                this.sokoban.board[i][j] = board[i][j]
            }
        }

        this.sokoban.player_position = this.sokoban.get_player_position()
        this.sokoban.end_positions = this.sokoban.get_end_positions()
    }


    init(board = undefined) {
        // await sleep(100)
        document.getElementById(this.screen + "_reset").style.display = "none"
        this.sokoban = new Sokoban(board)
        this.show_board(this.sokoban.board)
        this.machineControlsArea = document.getElementById(this.screen + "_" + "machine_controls_area");
        this.cancel = false
    }

    onMouseOver() {
        // let sokoban = this.sokoban
        let that = this
        window.onkeydown = function (ev) {

            if (that.sokoban.checkWin()) return true

            if (ev.key === "w" || ev.key === "ArrowUp") {
                that.makeAction(that.sokoban.UP)
            } else if (ev.key === "s" || ev.key === "ArrowDown") {
                that.makeAction(that.sokoban.DOWN)
            } else if (ev.key === "a" || ev.key === "ArrowLeft") {
                that.makeAction(that.sokoban.LEFT)
            } else if (ev.key === "d" || ev.key === "ArrowRight") {
                that.makeAction(that.sokoban.RIGHT)
            }

            return false
        }
    }

    makeMove(action) {
        this.makeAction(action)
    }


    makeAction(action) {
        this.sokoban.make_action(action, () => {
            this.step++
        })
        this.show_board()
        if (this.onMakeAction !== null)
            this.onMakeAction(this)
        if (this.sokoban.checkWin()) {
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
        this.sokobanGame.drawBoard(this.sokoban.board, this.sokoban.end_positions)
    }

    show_result = () => {
        document.getElementById(this.screen + "_reset").style.display = ""
        $('#' + this.screen + '_step').text(this.step)
        this.step = 0
    }

    machineRandomMove = () => {
        this.sokoban.makeRandomMove()

        this.show_board();

        if (this.sokoban.checkWin()) {
            this.show_result()
            // document.getElementById(this.screen).innerHTML +=
            //     "<br>Clear!<br> Step used: " + this.step +
            //     "<button id="+this.screen+"_reset type='submit'>Reset</button>"
            // document.getElementById(this.screen+"_reset").onclick = ()=>{this.init()}
        }
        // let actions = this.sokoban.get_legal_action()
        // let random_action = actions[Math.floor(Math.random()*actions.length)]
        // this.makeAction(random_action)
    }

    makeMctsMove = (interactive) => {
        let monteCarlo = new SokobanMCTS(this.sokoban)
        // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
        let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())
        interactive.setMCTS(monteCarlo, MCTS_search)

        // interactive.clickVisualizeLastStep()

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = "none"

        this.makeMove(MCTS_search.move)
        // this.endMove(MCTS_search.move.player)
    }

    machineMctsMove = (interactive) => {
        let monteCarlo = new SokobanMCTS(this.sokoban)
        // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
        let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = "none"

        interactive.setMCTS(monteCarlo, MCTS_search)
    }

    machineMctsMoveWithMyMCTS = (interactive, MyMCTS) => {
        let monteCarlo = new MyMCTS(this.sokoban)
        // let MCTS_search = monteCarlo.runSearch(sketch.mctsTimeoutSlider.value())
        let MCTS_search = monteCarlo.runSearch(interactive.tree_vis_p5.mctsTimeoutSlider.value())

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = "none"

        interactive.setMCTS(monteCarlo, MCTS_search)
    }

    cancelPlay = () => {
        this.cancel = true
    }

    autoPlay = async (interactive) => {
        document.getElementById("sokoban_cancel").style.display = ""
        document.getElementById("sokoban_autoplay").style.display = "none"
        document.getElementById("sokoban_reset").disabled = true
        document.getElementById("sokoban_mcts_move").disabled = true
        document.getElementById("sokoban_rand_move").disabled = true

        while (!this.sokoban.checkWin() && this.cancel === false) {
            this.makeMctsMove(interactive)
            await sleep(100)
        }
        document.getElementById("sokoban_cancel").style.display = "none"
        document.getElementById("sokoban_autoplay").style.display = ""
        document.getElementById("sokoban_reset").disabled = false
        document.getElementById("sokoban_mcts_move").disabled = false
        document.getElementById("sokoban_rand_move").disabled = false
        this.cancel = false
    }


    print_board() {
        let result_http = ""
        for (let i = 0; i < this.sokoban.board.length; i++) {
            for (let j = 0; j < this.sokoban.board[0].length; j++) {
                result_http += decide_emoji(this.sokoban.get_board_element([i, j]))
            }
            result_http += "<br>"
        }
        return result_http
    }

}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


