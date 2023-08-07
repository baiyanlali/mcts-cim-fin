import {Copy, New2DArray, RandomElement} from "../Util.js";


//rule of Go: https://en.wikipedia.org/wiki/Rules_of_Go#End
//rule based on Trump Taylor Scoring
export const GoTile = {
    Empty: 0,
    White: 1,
    Black: 2
}

const TILECNT = 7

function out_boundary(x, y) {
    return (x < 0 || x >= TILECNT || y < 0 || y >= TILECNT);
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

    passed = false

    end = false

    winner

    //用于处理劫的问题
    play_histroy = []

    constructor(board, turn_cnt = 0) {
        this.board = board ?? New2DArray(TILECNT, TILECNT, GoTile.Empty)
        this.turn_cnt = turn_cnt
    }

    copy() {
        const new_go = new Go(JSON.parse(JSON.stringify(this.board)), this.turn_cnt)
        new_go.play_histroy = Copy(this.play_histroy)
        new_go.passed = this.passed
        new_go.end = this.end
        return new_go
    }

    makeMove(arg){
        return this.make_action(arg)
    }

    makeRandomMove(){
        let actions = this.get_legal_action()
        let action = {position: RandomElement(actions)}
        return this.make_action(action)
    }


    make_action(move) {
        let position = move.position
        if(position === [-1, -1] || position === -1){
            if(this.passed){
                this.end = true
                this.winner = this.check_win(0)
                return "End"
            }
            this.passed = true
            this.turn_cnt++
            //pass
            return "Passed"
        }
        let x = position[0]
        let y = position[1]

        if (out_boundary(x, y))
            return "Out of Boundary"

        if (this.board[x][y] !== GoTile.Empty) {
            // there is already a piece
            return "No Empty Space"
        }

        // console.log(this.get_air_cnt(position))
        let air_cnt = this.get_air_cnt(position, this.current_player())
        const board_backup = JSON.parse(JSON.stringify(this.board))
        this.board[x][y] = this.current_player()
        let have_cleared = this.clear_dead_piece()
        if(!have_cleared && air_cnt === 0){
            //只有在没有清除敌方棋子并且当前格子没有气的时候才不让下该地方
            this.board = board_backup
            return "No Air"
        }

        if(this.play_histroy.includes(this.toString())){
            this.board = board_backup
            return "Jie Happened"
        }


        this.turn_cnt++
        if(this.turn_cnt >= 3) //只有大于3步才有可能出现劫的情况
            this.play_histroy.push(this.toString())

        // console.log(this.get_all_empty_groups(this.board))

        // console.log(`area information ${this.area()}`)

        return ""
    }

    get_legal_action() {
        let legal_actions = []

        for (let i = 0; i < TILECNT; i++) {
            for (let j = 0; j < TILECNT; j++) {
                if(this.board[i][j] === GoTile.Empty){
                    let air_cnt = this.get_air_cnt([i, j], this.current_player())
                    if(air_cnt >=0){
                        legal_actions.push([i, j])
                        continue
                    }
                    const board_backup = JSON.parse(JSON.stringify(this.board))
                    this.board[i][j] = this.current_player()
                    let have_cleared = this.clear_dead_piece()

                    if(!have_cleared && air_cnt === 0){
                        //只有在没有清除敌方棋子并且当前格子没有气的时候才不让下该地方
                        // No Air
                        this.board = board_backup
                        continue
                    }

                    if(this.play_histroy.includes(this.toString())){
                        // Jie Happened
                        this.board = board_backup
                        continue
                    }

                    legal_actions.push([i, j])
                    this.board = board_backup

                }
            }
        }

        if(legal_actions.length <= 5){
            legal_actions.push(-1)
        }

        return legal_actions
    }

    clear_dead_piece(){
        let have_cleared = false
        for (let i = 0; i < TILECNT; i++) {
            for (let j = 0; j < TILECNT; j++) {
                const element = this.board[i][j]
                if(element === this.opposite_player()){
                    let air = this.get_air_cnt([i, j], this.opposite_player())
                    if(air === 0)
                    {
                        this._clear_from([i, j])
                        have_cleared = true
                    }
                }
            }
        }
        return have_cleared
    }

    _clear_from(position){
        let color = this.board[position[0]][position[1]]
        this.board[position[0]][position[1]] = GoTile.Empty
        for (let i = 0; i < this.DIRECTIONS.length; i++) {
            const direction = this.DIRECTIONS[i];
            let neighbour = ToDirection(position, this.DIRECTIONS[i])
            if(out_boundary(neighbour[0], neighbour[1]))
                continue
            if(color === this.board[neighbour[0]][neighbour[1]]){
                this._clear_from(neighbour)
            }
        }
    }

    checkWin(komi = 0){
        return this.check_win(komi)
    }

    check_win(komi = 0){
        // false| No one wins, GoTile.Black| Black wins, GoTile.White| White wins, 999| Draw
        if(!this.end)   return false
        let [black, white] = this.area()
        if (black - white - komi === 0){
            //draw
            return 999
        }
        return black - white - komi > 0 ? GoTile.Black : GoTile.White
    }

    current_player() {
        return (this.turn_cnt % 2 === 0) ? GoTile.Black : GoTile.White
    }

    opposite_player() {
        return (this.turn_cnt % 2 === 0) ? GoTile.White : GoTile.Black
    }

    //get air count in specific position. Do not include this point
    get_air_cnt(position, player) {
        // console.log("air cnt of " + position)
        let visited_nodes = [JSON.stringify(position)]
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
                    // console.log("visited "+ neighbour)
                    continue
                }
                visited_nodes.push(JSON.stringify(neighbour))
                let neighbour_tile = this.board[neighbour[0]][neighbour[1]]
                if (neighbour_tile === GoTile.Empty) {
                    air_cnt++
                    // console.log(neighbour)
                } else if (neighbour_tile === player) {
                    air_cnt += get_air_cnt_in(neighbour)
                }
            }
            return air_cnt
        }
        // console.log(get_air_cnt_in(position))
        return get_air_cnt_in(position)
    }



    area(){

        let black_piece = this.board.map(subArr => subArr.filter(item => item === GoTile.Black)).reduce((count, subArr) => count + subArr.length, 0)
        let white_piece = this.board.map(subArr => subArr.filter(item => item === GoTile.White)).reduce((count, subArr) => count + subArr.length, 0)


        const empty_groups = this.get_all_empty_groups(this.board)

        for (const empty_group of empty_groups) {
            const expanded_group = this.expand_group(empty_group)
            let has_black = false
            let has_white = false
            for (const pos of expanded_group) {
                if(this.board[pos[0]][pos[1]] === GoTile.Black){
                    has_black = true
                }else if(this.board[pos[0]][pos[1]] === GoTile.White){
                    has_white = true
                }
            }

            if(has_black && !has_white){
                black_piece += empty_group.length
            }else if(has_white && !has_black){
                white_piece += empty_group.length
            }

        }
        return [black_piece, white_piece]
    }

    expand_group(group){
        let visited_nodes = []
        let expanded_nodes = []

        for (const position of group) {
            visited_nodes.push(JSON.stringify(position))
        }

        for (const position of group) {
            for (let i = 0; i < this.DIRECTIONS.length; i++) {
                const direction = this.DIRECTIONS[i]
                const new_pos = ToDirection(position, direction)
                if(out_boundary(new_pos[0], new_pos[1]))
                    continue
                if(visited_nodes.includes(JSON.stringify(new_pos)))
                    continue
                expanded_nodes.push(new_pos)
                visited_nodes.push(JSON.stringify(new_pos))
            }
        }
        return expanded_nodes
    }

    get_all_empty_groups(board){
        let empty_groups = []

        let visited_nodes = []

        let get_empty_group = (position) => {
            let empty_g = [position]
            if(out_boundary(position[0], position[1]) || this.board[position[0]][position[1]] !== GoTile.Empty)
                return null
            if(visited_nodes.includes(JSON.stringify(position)))
                return null

            visited_nodes.push(JSON.stringify(position))
            for (let i = 0; i < this.DIRECTIONS.length; i++) {
                let adj = ToDirection(position, this.DIRECTIONS[i])
                let group = get_empty_group(adj)
                if(group !== null)
                    empty_g = empty_g.concat(group)
            }
            return empty_g
        }

        for (let i = 0; i < TILECNT; i++) {
            for (let j = 0; j < TILECNT; j++) {
                let g = get_empty_group([i, j])
                if(g === null)  continue
                empty_groups.push(g)
            }
        }

        return empty_groups
    }

    toString() {
        return JSON.stringify(this.board)
    }

}