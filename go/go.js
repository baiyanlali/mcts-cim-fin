export const GoTile = {
    Empty: 0,
    White: 1,
    Black: 2
}

function out_boundary(x, y){
    return (x < 0 || x > 7 || y < 0 || y > 7);
}

function ToDirection(pos, direction) {
    let new_pos = [pos[0] + direction[0], pos[1] + direction[1]]
    if(out_boundary(new_pos[0], new_pos[1]))
        return false

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

    constructor(board, turn_cnt = 0) {
        this.board = board ?? [
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty],
            [GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty, GoTile.Empty]
        ]

        this.turn_cnt = turn_cnt

    }


    make_action(position) {
        let x = position[0]
        let y = position[1]

        if(out_boundary(x, y))
            return

        if (this.board[x][y] !== GoTile.Empty) {
            // there is already a piece
            return
        }


    }

    get_air_cnt(position){
        if(out_boundary(position[0], position[1]))
            return 0
    }

    have_air(position){
        if(out_boundary(position[0], position[1]))
            return false



        return true
    }

}