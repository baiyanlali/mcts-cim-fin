function add(p1, p2) {
    return [p1[0] + p2[0], p1[1] + p2[1]]
}

function minus(p1, p2) {
    return [p1[0] - p2[0], p1[1] - p2[1]]
}

function multiply(dir, scalar) {
    return [dir[0] * scalar, dir[1] * scalar]
}

export const SokobanTile = {
    Empty: 0,
    Wall: 1,
    Box: 2,
    End: 3,
    UNKNOWN: 4,
    Player: 5
}

export default class Sokoban {
    RIGHT = [0, 1]
    LEFT = [0, -1]
    UP = [-1, 0]
    DOWN = [1, 0]

    DIRECTIONS = [this.UP, this.DOWN, this.LEFT, this.RIGHT]


    player_position

    end_positions

    //empty 0, wall 1, box 2, end 3, player 5
    constructor(board, player_position, end_positions) {
        this.board = board ?? [
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 3, 1, 0, 0, 0],
            [0, 0, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 2, 0, 2, 3, 1],
            [1, 3, 0, 2, 5, 1, 1, 1],
            [1, 1, 1, 1, 2, 1, 0, 0],
            [0, 0, 0, 1, 3, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
        ]
        // this.board = board ?? [
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 3, 3, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 1, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 2, 0, 5, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        // ]
        this.player_position = player_position ?? this.get_player_position()
        this.end_positions = end_positions ?? this.get_end_positions()

    }

    get_player_position() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] === 5)
                    return [i, j]
            }
        }
    }

    get_end_positions() {
        let end_positions = []
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] === 3)
                    end_positions.push([i, j])
            }
        }
        return end_positions
    }

    get_box_positions() {
        let box_positions = []
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                if (this.board[i][j] === 2)
                    box_positions.push([i, j])
            }
        }
        return box_positions
    }

    check_bound(position) {
        if (position[0] < 0 || position[0] >= this.board.length) return false
        if (position[1] < 0 || position[1] >= this.board[0].length) return false
        return true
    }

    get_board_element(position) {
        return this.board[position[0]][position[1]]
    }

    set_board_element(position, element) {
        this.board[position[0]][position[1]] = element
    }


    get_legal_action() {
        let direction = []
        for (let i = 0; i < this.DIRECTIONS.length; i++) {
            const dir = this.DIRECTIONS[i]
            if (this.is_legal_action(dir)) direction.push(dir)
        }
        return direction
    }

    is_legal_action(dir) {
        const target_position = add(this.player_position, dir)
        //判断是否越界
        if (this.check_bound(target_position) === false) return false
        //判断是否撞墙
        if (this.get_board_element(target_position) === 1) return false
        //判断箱子是否靠着墙
        if (this.get_board_element(target_position) === 2) {
            // console.log("count shit!" + target_position)
            let pushable = false
            for (let i = 2; i < this.board.length; i++) {
                let pos = add(this.player_position, multiply(dir, i))
                let pos_element = this.get_board_element(pos)
                if (this.check_bound(pos) === false) break
                if (pos_element === 0 || pos_element === 3) {
                    pushable = true
                    break
                } else if (pos_element === 1) {
                    pushable = false
                    break
                } else if (pos_element === 2) {
                    continue
                }

            }
            // console.log("pushable is "+pushable)
            if (pushable === false) return false
        }
        // console.log("return true")
        return true
    }

    checkWin() {
        for (let i = 0; i < this.end_positions.length; i++) {
            let end_pos = this.end_positions[i]
            if (this.get_board_element(end_pos) !== 2) return false
        }
        return true
    }

    checkFilledHoles() {
        let cnt = 0
        for (let i = 0; i < this.end_positions.length; i++) {
            let end_pos = this.end_positions[i]
            if (this.get_board_element(end_pos) === 2) cnt++
        }
        return cnt
    }


    checkBoxDistance() {
        let distance = 0
        let box_positions = this.get_box_positions()

        for (let j = 0; j < box_positions.length; j++) {
            let min_dis = 6666666
            for (let i = 0; i < this.end_positions.length; i++) {
                min_dis = Math.min(min_dis, this.end_positions[i][0] - box_positions[j][0] + this.end_positions[i][1] - box_positions[j][1])
            }
            distance += min_dis
        }

        return distance
    }

    makeRandomMove() {
        let actions = this.get_legal_action()
        let random_action = actions[Math.floor(Math.random() * actions.length)]
        this.make_action(random_action)
        // this.print()
    }

    makeMove(dir) {
        this.make_action(dir)
    }

    //假设目前
    make_action(dir, onDone = null) {
        if (this.is_legal_action(dir) === false) return
        // console.log("move")
        const target_position = add(this.player_position, dir)
        let target_element = this.get_board_element(target_position)
        if (target_element === 0 || target_element === 3) {
            this.set_board_element(target_position, 5)
            this.set_board_element(this.player_position, 0)
            this.player_position = target_position
        } else if (target_element === 2) {
            //暂时不考虑推多个箱子的情况
            this.set_board_element(add(target_position, dir), 2)
            // console.log("push push!")
            this.set_board_element(target_position, 5)
            this.set_board_element(this.player_position, 0)
            this.player_position = target_position
        }

        for (let i = 0; i < this.end_positions.length; i++) {
            let end = this.end_positions[i]
            if (this.get_board_element(end) === 0) {
                this.set_board_element(end, 3)
            }
        }

        if (onDone !== null) {
            onDone()
        }

    }

    copy() {
        return new Sokoban(
            JSON.parse(JSON.stringify(this.board)),
            JSON.parse(JSON.stringify(this.player_position)),
            JSON.parse(JSON.stringify(this.end_positions))
        )

    }

    decide_emoji(mapcode) {
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

    print() {
        let result_http = ""
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[0].length; j++) {
                result_http += this.decide_emoji(this.get_board_element([i, j]))
            }
            result_http += "<br>"
        }
        return result_http
    }
}