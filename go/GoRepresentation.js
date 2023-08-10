import Go, {GoTile} from "./go.js";
import {FromMCTS} from "./go_mcts.js";
import {sketch_go} from "./GoGame.js";


const go_representation = (s) => {

    s.onFinished = null
    s.go = null

    s.setup = () => {
        s.canvas_id = s._userNode.id
        let size = Math.max(s._userNode.offsetWidth, s._userNode.offsetHeight)
        s.canvas = s.createCanvas(size, size)
        s.board = null
        if(s.onFinished!==null){
            s.onFinished()
        }
    }

    s.draw = () => {
        s.background(255)
        if (s.go === null) return
        s.drawBoard()
    }

    s.drawBoard = () => {
        s.board = s.go.board
        let textSize = 25 / 200 * s.width
        let tileSize = s.width / s.board.length
        for (let i = 0; i < s.board.length; i++) {
            for (let j = 0; j < s.board.length; j++) {
                let tile = s.board[j][i]
                // s.fill(tile / 5 * 255)
                s.fill(255)
                s.rect(j * tileSize, i * tileSize, tileSize, tileSize)
                s.fill(0)
                s.textSize(textSize)
                s.textAlign(s.CENTER, s.CENTER)
                s.text(tile, j * tileSize + tileSize / 2, i * tileSize + tileSize / 2 + 3)
            }
        }
    }

}

export default class GoRepresentation{
    screen;
    screendiv;

    constructor() {
        this.goGame = new p5(sketch_go, "goRepre1")
        this.goGameRepre = new p5(go_representation, "goRepre2")

        this.goGame.onMouseClicked = (tile) => {
            if (JSON.stringify( tile) === JSON.stringify( [-1, -1])) return
            this.makeAction(new GameMove(this.go.current_player(), tile))
        }
        this.go = new Go(null)

        //不被人机对战的规则限制
        this.goGame.MachineColor = 999

        this.goGame.go = this.go
        this.goGameRepre.go = this.go

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
        this.go = new Go(board)
        this.show_board(this.go.board)
        this.cancel = false
        this.goGame.go = this.go
        this.goGameRepre.go = this.go
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
            this.show_result()
        }

        document.getElementById("goRepreResult").style.display = "none"
    }

    show_board() {
        this.goGame.drawBoard(this.go.board)
    }

    show_result = () => {
        const [black, white] = this.go.area()
        document.getElementById("goRepreResult").style.display = ""
        document.getElementById("goRepreResult").innerHTML = `Black Area: ${black}<br> White Area: ${white} <br>${black === white?'Draw': black> white? 'Black wins': 'White wins'}`
    }


    pass = () => {
        this.go.make_action({position: -1})
    }

    undo = () => {
        this.go.Undo()
        this.show_board()
    }
}