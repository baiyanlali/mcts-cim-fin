import {Copy, New2DArray} from "../Util.js";

export const GoTile = {
    Empty: 0,
    White: 1,
    Black: 2
}

const TILECNT = 7

function out_boundary(x, y) {
    return (x < 0 || x > 7 || y < 0 || y > 7);
}

function ToDirection(pos, direction) {
    let new_pos = [pos[0] + direction[0], pos[1] + direction[1]]

    return new_pos
}

export default class Go {
    RIGHT = [0, 1]
    LEFT = [0, -1]
    UP = [-1, 0]
    DOWN = [1, 0]

    DIRECTIONS = [this.UP, this.DOWN, this.LEFT, this.RIGHT]

    board

    turn_cnt

    //用于处理劫的问题
    play_histroy = []

    constructor(board, turn_cnt = 0) {
        this.board = board ?? New2DArray(TILECNT, TILECNT, GoTile.Empty)
        this.turn_cnt = turn_cnt
    }

    copy() {
        const new_go = new Go(JSON.parse(JSON.stringify(this.board)), this.turn_cnt)
        new_go.play_histroy = Copy(this.play_histroy)
    }


    make_action(position) {
        let x = position[0]
        let y = position[1]

        if (out_boundary(x, y))
            return

        if (this.board[x][y] !== GoTile.Empty) {
            // there is already a piece
            return
        }


        this.board[x][y] = this.current_player()

        this.turn_cnt++

        this.play_histroy.push(this.toString())
    }

    get_legal_action() {

    }

    current_player() {
        return (this.turn_cnt % 2 === 0) ? GoTile.Black : GoTile.White
    }

    //get air count in specific position. Do not include this point
    get_air_cnt(position) {

        let visited_nodes = []
        let get_air_cnt_in = (position) => {
            if (out_boundary(position[0], position[1]))
                return 0
            let air_cnt = 0
            for (let i = 0; i < 4; i++) {
                //four directions
                let neighbour = ToDirection(position, this.DIRECTIONS[i])
                if (out_boundary(neighbour[0], neighbour[1])) {
                    continue
                }else if(visited_nodes.includes(JSON.stringify(neighbour))){
                    continue
                }
                visited_nodes.push(JSON.stringify(neighbour))
                let neighbour_tile = this.board[neighbour[0]][neighbour[1]]
                if (neighbour_tile === GoTile.Empty) {
                    air_cnt++
                } else if (neighbour_tile === current_player()) {
                    air_cnt += get_air_cnt_in(neighbour)
                }
            }
            return air_cnt
        }

        return get_air_cnt_in(position)
    }

    // get_air_cnt(position) {
    //     if (out_boundary(position[0], position[1]))
    //         return 0
    //     let air_cnt = 0
    //     for (let i = 0; i < 4; i++) {
    //         //four directions
    //         let neighbour = ToDirection(position, this.DIRECTIONS[i])
    //         if (neighbour === false) continue
    //         air_cnt += this.board[neighbour[0]][neighbour[1]] === 0 ? 1 : 0
    //     }
    //     return air_cnt
    // }

    //if placed in current position, whether there is an air
    have_air(position) {
        if (out_boundary(position[0], position[1]))
            return false
        let air_cnt = this.get_air_cnt(position)

        return air_cnt !== 0
    }

    is_jie() {
        // assume the piece is already placed
        for (const history of this.play_histroy) {
            if (this.toString() === history) {
                return true
            }
        }
        return false
    }

    checkWin() {
        return false
    }

    toString() {
        return JSON.stringify(this.board)
    }

}