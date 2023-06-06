import {SokobanTile} from "./sokoban.js"

export const sketch_sokoban_editor = (s) => {

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
    s.hoveredTile = -1

    s.setup = () => {
        let canvasContainer = document.getElementById("editor_eee")

        s.canvas = s.createCanvas(200, 200)
        // s.canvas.style = "border: solid 1px black;border-radius: 10px;"
        s.canvas.parent(canvasContainer)
        s.canvas.id("editororor")
        s.clear()
        s.hasSetup = true
        s.noSmooth()


        if (s.onSetup !== null) {
            s.onSetup(s.onSetupParams[0], s.onSetupParams[1])
        }

        s.tileNum = 6
        s.board = Array.from({length: s.tileNum}, () => new Array(s.tileNum).fill(SokobanTile.Empty))
        s.board[0][0] = SokobanTile.Player
        s.player_position = [0, 0]
    }

    s.handleHover = () => {
        let mouseX = s.mouseX;
        let mouseY = s.mouseY;

        for (let i = 0; i < s.tileNum; i++) {
            for (let j = 0; j < s.tileNum; j++) {
                if (mouseX > (j * s.tileSize) && mouseX < ((j + 1) * s.tileSize)
                    && mouseY > (i * s.tileSize) && mouseY < ((i + 1) * s.tileSize)) {
                    s.hoveredTile = j + i * s.tileNum;
                    return;
                }
            }
        }

        s.hoveredTile = -1;
    }

    s.lastTile = [0, 0]

    s.mouseDragged = (event) => {
        if (!(s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height)) return true
        // console.log("dragged!", event)
        s.tileSize = (s.width - 20) / s.tileNum;

        let tile_y = Math.floor(s.mouseX / s.tileSize)
        let tile_x = Math.floor(s.mouseY / s.tileSize)

        if(tile_x === s.lastTile[0] && tile_y === s.lastTile[1]){
            return false
        }

        if (s.board[tile_x][tile_y] === SokobanTile.Player) return
        s.board[tile_x][tile_y] += 1
        if (s.board[tile_x][tile_y] === SokobanTile.UNKNOWN) s.board[tile_x][tile_y] = SokobanTile.Empty
        s.lastTile = [tile_x, tile_y]
        s.drawBoard()
        return false
    }

    s.mousePressed = () => {
        if (!(s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height)) return true
        // console.log("pressed!")
        s.tileSize = (s.width - 20) / s.tileNum;

        let tile_y = Math.floor(s.mouseX / s.tileSize)
        let tile_x = Math.floor(s.mouseY / s.tileSize)
        if (s.board[tile_x][tile_y] === SokobanTile.Player) return false
        s.board[tile_x][tile_y] += 1
        if (s.board[tile_x][tile_y] === SokobanTile.UNKNOWN) s.board[tile_x][tile_y] = SokobanTile.Empty
        s.lastTile = [tile_x, tile_y]
        s.drawBoard()
        return false
    }

    s.changeSize = (row, column) => {
        row = parseInt(row)
        column = parseInt(column)
        // let new_board = Array(row).fill(0).map(() => Array(column).fill(SokobanTile.Empty))
        let new_board = Array.from({length: row}, () => new Array(column).fill(SokobanTile.Empty))
        for (let i = 0; i < Math.min(row, s.board.length); i++) {
            for (let j = 0; j < Math.min(column, s.board[0].length); j++) {
                new_board[i][j] = s.board[i][j]
            }
        }
        s.board = new_board
        s.tileNum = row
        s.tileSize = (s.width - 20) / s.tileNum

    }

    s.getBoard = () => s.board

    s.draw = () => {
        s.handleHover()
        s.drawBoard()
    }

    s.keyPressed = () => {
        if (!(s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height)) return true
        let direction = [0, 0]
        let player_pos = s.player_position
        switch (s.keyCode) {
            case 87:
            case 38:
                //UP
                direction = [-1, 0]
                break;
            case 65:
            case 37:
                direction = [0, -1]
                //LEFT
                break;
            case 68:
            case 39:
                direction = [0, 1]
                //RIGHT
                break;
            case 40:
            case 83:
                direction = [1, 0]
                //DOWN
                break;
        }

        let nextPosition = [player_pos[0] + direction[0], player_pos[1] + direction[1]]

        if (nextPosition[0] >= 0 && nextPosition[0] < s.tileNum && nextPosition[1] >= 0 && nextPosition[1] < s.tileNum) {
            s.board[nextPosition[0]][nextPosition[1]] = SokobanTile.Player
            s.board[player_pos[0]][player_pos[1]] = SokobanTile.Empty
            s.player_position = nextPosition
        }
        return false
    }

    s.drawBoard = () => {
        let board = s.board

        if (s.hasSetup === false) {
            s.onSetup = s.drawBoard
            s.onSetupParams = [board]
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
                        object_on_current_tile = s.box
                        break
                    case SokobanTile.End:
                        object_on_current_tile = s.destination
                        break
                }
                if (j + i * s.tileNum === s.hoveredTile) {
                    s.fill("#dfe6e9");
                    s.rect(j * s.tileSize, i * s.tileSize, s.tileSize, s.tileSize);
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

export default class SokobanMapEditor {
    constructor(sokobanGame, sokobanEditor) {
        this.game = sokobanGame
        this.editor = sokobanEditor

    }

    clearBoard(){
        this.editor.board = Array.from({length: this.editor.tileNum}, () => new Array(this.editor.tileNum).fill(SokobanTile.Empty))
        this.editor.board[0][0] = SokobanTile.Player
        this.editor.player_position = [0, 0]
        this.game.set_board(this.editor.board)
        this.game.show_board()
    }


    synthBoard() {
        console.log("synth!")
        // this.game.sokoban.board = Array.from({length: this.editor.board.length}, ()=>new Array(this.editor.board[0].length).fill(0))
        // for (let i = 0; i < this.editor.board.length; i++) {
        //     for (let j = 0; j < this.editor.board[0].length; j++) {
        //         this.game.sokoban.board[i][j] = this.editor.board[i][j]
        //     }
        // }
        // console.log(this.editor.board)

        let boxes = this.editor.board.flat().filter((p) => p === SokobanTile.Box)
        let ends = this.editor.board.flat().filter((p) => p === SokobanTile.End)

        // console.log(boxes)
        // console.log(ends)

        if (boxes === null || boxes.length === 0) {
            window.alert("No box found!")
            return;
        } else if (ends === null || ends.length === 0) {
            window.alert("No ends found!")
            return;
        } else if (boxes.length !== ends.length) {
            window.alert("Box and Ends not matches!")
            return;
        }
        this.game.set_board(this.editor.board)
        this.game.show_board()
    }
}