import Go, {GoTile} from "./go.js";
import {FromMCTS} from "./go_mcts.js";

const TILECNT = 7

const MachineColor = GoTile.Black

export const sketch_go = (s) => {

    s.preload = () => {
    }

    s.hasSetup = false

    s.onSetup = null
    s.onSetupParams = null

    s.hoveredTile = [-1, -1]

    s.lastBoard = null

    s.go = null

    s.goGame = null

    s.disabled = false

    s.MachineColor = MachineColor

    s.onMouseClicked = (tile) => {
    }

    s.setup = () => {
        s.canvas = s.createCanvas(200, 220)
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
        if(!s.disabled)
            s.handleHover()
        if(s.go)
            s.drawBoard(null)
    }

    s.drawBoard = (board, step = 0) => {


        if (s.hasSetup === false) {
            s.onSetup = s.drawBoard
            s.onSetupParams = [board, step]
            return
        }

        
        s.push()
        

        s.translate(15, 15);

        if (board)
            s.lastBoard = board
        else
            board = s.lastBoard

        if(board === null) board = s.go.board

        let tileNum = Math.max(board.length, board[0].length)
        s.tileSize = (s.width - 20) / tileNum;
        s.clear()

        s.fill(219, 178, 134)
        s.rect(-s.tileSize / 2, -s.tileSize / 2, s.tileSize * (TILECNT), s.tileSize * (TILECNT))
        // s.background(219, 178, 134)



        s.strokeWeight(1.5)

        //draw the base board

        let [black_area, white_area] = s.go.get_area()
        if(s.check_area){
            black_area = black_area.map(p => JSON.stringify(p))
            white_area = white_area.map(p => JSON.stringify(p))
        }

        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
                if (i !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, (i + 1) * s.tileSize, j * s.tileSize)
                if (j !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, i * s.tileSize, (j + 1) * s.tileSize)
                let radius = 2

                switch (board[i][j]) {
                    case GoTile.Empty:
                        s.fill(0)
                        if (i === s.hoveredTile[0] && j === s.hoveredTile[1]) {
                            s.fill(255, 0, 0, 50)
                            radius = 0
                            s.rect(i * s.tileSize - 10, j * s.tileSize - 10, 20, 20)
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
                if(s.check_area){
                    const rect_size = 6
                    if(white_area.includes(JSON.stringify([i, j]))){
                        // console.log("white!")
                        s.push()
                        s.fill(255)
                        s.rect(i * s.tileSize - rect_size / 2, j * s.tileSize - rect_size / 2, rect_size)
                        s.pop()
                    }else if(black_area.includes(JSON.stringify([i, j]))){
                        s.push()
                        s.stroke(255)
                        s.fill(0)
                        s.rect(i * s.tileSize - rect_size / 2, j * s.tileSize - rect_size / 2, rect_size)
                        s.pop()
                    }
                }
            }
        }

        s.pop()

        if (s.go === null) return

        if (s.go.end) {
            s.text(`Winner: ${s.go.winner === 999 ? "Draw" : s.go.winner === GoTile.White ? "White" : "Black"} | ${s.go.turn_cnt} step(s)`, 15, 200)
        } else {
            s.text(`${s.go.current_player() === GoTile.White? 'Player White':'Player Black'} | ${s.go.turn_cnt} step(s) ${s.go.passed ? "| Pass":""}`, 15, 200)
        }
    }

    s.mouseClicked = () => {
        s.onMouseClicked(s.hoveredTile)
    }


    s.handleHover = () => {

        if(s.go){
            if(s.mcts){
                s.hoveredTile = [-1, -1]
                return
            }
        }

        let mouseX = s.mouseX;
        let mouseY = s.mouseY;
        let tileNum = 7

        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
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


const machine_control = [
    document.getElementById('go_mcts_move'),
    document.getElementById('go_rand_move'),
    document.getElementById('go_reset'),
    document.getElementById('go_mcts_tree_vis_mcts_timeout_slider'),
]

const end_control = [
    document.getElementById('go_mcts_move'),
    document.getElementById('go_rand_move'),
    document.getElementById('go_undo'),
    document.getElementById('go_mcts_tree_vis_mcts_timeout_slider'),
]

// const human_control = [
//     document.getElementById('go_mcts_move'),
//     document.getElementById('go_rand_move'),
//     document.getElementById('go_reset'),
//     // document.getElementById('go_pass'),
//     document.getElementById('go_mcts_tree_vis_mcts_timeout_slider'),
// ]

export default class GoGame {
    screen;
    screendiv;
    that;

    constructor(screenID = "", board = undefined) {
        this.goGame = new p5(sketch_go, screenID + "p5_go")

        this.goGame.onMouseClicked = (tile) => {
            if (JSON.stringify( tile) === JSON.stringify( [-1, -1])) return
            this.makeAction(new GameMove(this.go.current_player(), tile))
        }
        // console.log(screenID+"p5_game")
        this.that = this
        this.screenID = screenID
        this.screen = screenID + "gogame"
        this.screendiv = screenID + "gogamediv"
        this.go = new Go(board)

        this.goGame.go = this.go
        this.goGame.goGame = this
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
        // document.getElementById(this.screen + "_reset").style.display = "none"
        this.go = new Go(board)
        this.show_board(this.go.board)
        this.machineControlsArea = document.getElementById(this.screen + "_" + "machine_controls_area");
        this.cancel = false
        this.goGame.go = this.go
        this.goGame.goGame = this
        machine_control.forEach(r=>r.disabled = false)
        document.getElementById(this.screen + "_area").style.display = "none"
        document.getElementById('go_undo').disabled = false
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
        // if (this.go.checkWin()) {
        //     // document.getElementById(this.screen).innerHTML +=
        //     //     "<br>Clear!<br>" +
        //     //     "<button id="+this.screen+"_reset type='submit'>Reset</button>"
        //     // document.getElementById(this.screen+"_reset").onclick = ()=>{this.init()}
        //     this.show_result()
        // }

        if (this.machineControlsArea)
            this.machineControlsArea.style.display = ""


        this.takeTurn()

        // console.log(this.go.end)

    }

    takeTurn(){
        // machine_control.forEach(e=>{
        //     e.disabled = this.go.current_player() !== MachineColor
        // })
        this.goGame.check_area = false
        document.getElementById(this.screen + "_area").style.display = "none"
        if(this.go.end){
            console.log("win!!")
            this.show_result(true)
        }
    }

    show_board() {
        // document.getElementById(this.screen).innerHTML = this.print_board()
        this.goGame.go = this.go
        this.goGame.drawBoard(this.go.board)
    }

    show_result = (check_win = false) => {
        this.checkArea(check_win)
        end_control.forEach(c=>c.disabled = true)
        document.getElementById('go_reset').disabled = false
    }

    machineRandomMove = () => {

        // if(this.go.current_player() !== MachineColor) return

        const result = this.go.makeRandomMove()

        this.show_board()

        // if(result === -1){
        //     document.getElementById(this.screen + "_area").style.display = "none"
        //     this.show_result(true)
        //     return
        // }

        this.takeTurn()
    }

    pass = () => {
        this.go.make_action({position: -1})
    }

    checkArea = (check_win = false)=>{
        // console.log("check area")
        this.goGame.check_area = true
        const [black, white] = this.go.area()
        document.getElementById(this.screen + "_area").style.display = ""
        if(check_win)
            document.getElementById(this.screen + "_area").innerHTML = `Black Area: ${black}<br> White Area: ${white} <br>${black === white?'Draw': black> white? 'Black wins': 'White wins'}`
        else
            document.getElementById(this.screen + "_area").innerHTML = `Black Area: ${black}<br> White Area: ${white}`
    }

    setButtons = (active = false)=>{
        this.disabled_btns?.forEach((e)=>{
            e.disabled = !active
        })
        this.goGame.mcts = !active
    }

    machineMctsMove = async (interactive, disabled_btns, value) => {

        // if(this.go.current_player() !== MachineColor) return
        this.disabled_btns = disabled_btns
        this.goGame.mcts = true
        document.getElementById(this.screen + "_loadingbar").style.display = ""
        const worker = new Worker("./go/worker.js")
        const iteration = interactive.tree_vis_p5.mctsTimeoutSlider.value()
        disabled_btns.forEach((e)=>{
                e.disabled = true
        })
        this.goGame.disabled = true
        worker.postMessage({
            iteration: iteration,
            go: this.go
        })
        worker.onmessage = (event)=>{
            let [monteCarlo, result] = event.data
        //     disabled_btns.forEach((e)=>{
        //         e.disabled = false
        // })
            //需要对传回来的结果加入函数，否则传回来的变量都没法调用内部函数
            result.move = new GameMove(result.move.player, result.move.position)
            monteCarlo = FromMCTS(monteCarlo)
            interactive.setMCTS(monteCarlo, result)
            document.getElementById(this.screen + "_loadingbar").style.display = "none"
            this.goGame.disabled = false
            this.takeTurn()

        }

    }


    undo = () => {
        this.go.Undo()
        this.show_board()
        this.takeTurn()
    }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))


