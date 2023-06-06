import Sokoban, {SokobanTile} from "./sokoban.js"

function decide_emoji(mapcode) {
    let ret = " "
    switch (mapcode) {
        case 0:
            ret = "&#128306;"
            break
        case 1:
            ret = "&#128307;"
            break
        case 2:
            ret = "&#128169;"
            break
        case 3:
            ret = "&#128308;"
            break
        case 5:
            ret = "&#128118;"
            break
    }
    return ret
}

const sketch_sokoban = (s) => {

    s.preload = () => {

        s.box = s.loadImage('image/sokoban/Box.png')
        s.destination = s.loadImage('image/sokoban/Destination.png')
        s.player = s.loadImage('image/sokoban/Player.png')
        s.wall = s.loadImage('image/sokoban/Wall.png')
        s.boxEnd = s.loadImage('image/sokoban/BoxEnd.png')
    }

    s.hasSetup = false

    s.onSetup = null
    s.onSetupParams = null

    s.setup = () => {

        s.canvas = s.createCanvas(200, 200)
        s.clear()
        s.hasSetup = true

        if (s.onSetup !== null) {
            s.onSetup(s.onSetupParams[0], s.onSetupParams[1])
        }
    }

    s.draw = () => {
    }

    s.drawBoard = (board, end) => {

        if (s.hasSetup === false) {
            s.onSetup = s.drawBoard
            s.onSetupParams = [board, end]
            return
        }

        // s.noSmooth()

        let tileNum = Math.max(board.length, board[0].length)
        s.tileSize = (s.width - 20) / tileNum;
        s.clear()
        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
                let tile = board[i][j];

                let object_on_current_tile = null

                switch (tile) {
                    case SokobanTile.Player:
                        object_on_current_tile = s.player
                        break
                    case SokobanTile.Wall:
                        object_on_current_tile = s.wall
                        break
                    case SokobanTile.Box:
                        if (s.hasEndPositions([i, j], end))
                            object_on_current_tile = s.boxEnd
                        else
                            object_on_current_tile = s.box

                        break
                    case SokobanTile.End:
                        object_on_current_tile = s.destination
                        break
                }


                if (object_on_current_tile !== null)
                    s.image(object_on_current_tile, j * s.tileSize, i * s.tileSize, s.tileSize, s.tileSize)
            }
        }
    }

    s.hasEndPositions = (pos, end) => {
        for (let i = 0; i < end.length; i++) {
            let end_position = end[i]
            if (end_position[0] === pos[0] && end_position[1] === pos[1]) return true
        }
        return false
    }


}

export default class SokobanGame {
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


    async init(board = undefined) {
        await sleep(100)
        document.getElementById(this.screen + "_reset").style.display = "none"
        this.sokoban = new Sokoban(this.init_board ?? board)
        this.show_board(this.sokoban.board)
        if(board !== undefined)
            this.init_board = JSON.parse(JSON.stringify(board))
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
        while (!this.sokoban.checkWin() && this.cancel === false) {
            this.makeMctsMove(interactive)
            await sleep(100)
        }

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


