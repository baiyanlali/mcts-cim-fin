// importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");
importScripts("../mcts-viz/lib/tree.js");

//因为worker不支持es6语法，而我又懒得用webpack打包，所以这里把需要用到的代码都扔进来了。是个巨大的垃圾桶。

// const obj = {
//     run(iteration){
//         const monteCarlo = new GoMCTS(this.go)
//         const result = monteCarlo.runSearch(iteration)
//         return [monteCarlo, result]
//     },
//     haha(){
//         return "haha"
//     }
// }
//
// Comlink.expose(obj)

function runMonteCarlo(event) {
    const data = event.data
    const monteCarlo = new GoMCTS(data.go)
    const result = monteCarlo.runSearch(data.iteration)
    postMessage([monteCarlo, result])
    self.close()
}

self.addEventListener("message", runMonteCarlo)


////////////////////////////////////////////////////////////////
///////////////////// 以下仅是一些丑陋的重复代码 ///////////////////
///////////////////////////////////////////////////////////////


function NodeCopy(nonono) {
    return new Node(nonono.data, nonono.id, nonono.children_id.slice(), nonono.parent_id);
}

const GoTile = {
    Empty: 0,
    White: 1,
    Black: 2
}

function getOtherPlayer(player) {
    return player === GoTile.White ? GoTile.Black : GoTile.White;
}

Array.prototype.indexOf = function (val) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === val) return i;
    }
    return -1;
}

Array.prototype.remove = function (val) {
    let index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1)
    }
}

function New2DArray(j, k, fill){
    return Array(j)
        .fill(fill)
        .map(() => Array(k).fill(fill));
}

//only copy the reference and value of the list
function Copy(originList){
    let new_array = []
    for (const item of originList) {
        new_array.push(item)
    }
    return new_array
}

function RandomElement(arr){
    return arr[Math.floor(Math.random() * arr.length)]
}



class AlgAction {
    constructor(kind, node_id, old_data, new_data) {
        this.kind = kind;
        this.node_id = node_id;
        this.old_data = old_data;
        this.new_data = new_data;
    }
}

const TILECNT = 7;


function out_boundary(x, y) {
    return (x < 0 || x >= TILECNT || y < 0 || y >= TILECNT);
}

function ToDirection(pos, direction) {
    let new_pos = [pos[0] + direction[0], pos[1] + direction[1]]

    return new_pos
}

function GoCopy(gogogo){
    const new_go = new Go(JSON.parse(JSON.stringify(gogogo.board)), gogogo.turn_cnt, gogogo.legal_actions)
    new_go.play_histroy = Copy(gogogo.play_histroy)
    new_go.passed = gogogo.passed
    new_go.end = gogogo.end
    return new_go
}

class Go {
    RIGHT = [0, 1]
    LEFT = [0, -1]
    UP = [-1, 0]
    DOWN = [1, 0]

    DIRECTIONS = [this.UP, this.DOWN, this.LEFT, this.RIGHT]

    // legal_actions = []
    
    board

    turn_cnt

    passed = false

    end = false

    winner

    //用于处理劫的问题
    play_histroy = []

    constructor(board, turn_cnt = 0, legal_actions = null) {
        this.board = board ?? New2DArray(TILECNT, TILECNT, GoTile.Empty)
        this.turn_cnt = turn_cnt
        // if(legal_actions)
        //     this.legal_actions = Copy(legal_actions)
        // else
        //     this.legal_actions = this.get_legal_action()
    }

    makeMove(arg){
        return this.make_action(arg)
    }

    makeRandomMove(){
        let actions = this.get_legal_action()
        // let action = {position: RandomElement(actions)}
        // return this.make_action(action)
        return this.make_quick_action(RandomElement(actions))
    }

    make_quick_action(position){
        if(position === -1){
            if(this.passed){
                this.end = true
                this.winner = this.check_win(0)
                return "End"
            }
            this.passed = true
            this.turn_cnt++
            return "Passed"
        }

        if(position[0] === undefined){
            position = position.position
        }

        this.passed = false
        const x = position[0]
        const y = position[1]

        this.board[x][y] = this.current_player()
        const have_cleared = this.clear_dead_piece()

        this.turn_cnt++
        if(this.turn_cnt >= 3) //只有大于3步才有可能出现劫的情况
            this.play_histroy.push(this.toString())

        // this.legal_actions = this.get_legal_action()
        return ""
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
        this.passed = false
        let x = position[0]
        let y = position[1]

        if (out_boundary(x, y))
            return "Out of Boundary"

        if (this.board[x][y] !== GoTile.Empty) {
            // there is already a piece
            return "No Empty Space"
        }

        // console.log(this.get_air_cnt(position))
        let air_result = this.get_air_cnt_position(position, this.current_player())
        // console.log(air_result.playerPositions);
        let air_cnt = air_result.airCount
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
        // this.legal_actions = this.get_legal_action()
        return ""
    }

    get_legal_action() {
        let legal_actions = []
        
        let matrixSize = 8;
        let initializedMatrix = [];

            for (let i = 0; i < matrixSize; i++) {
                let row = new Array(matrixSize).fill(0);
                initializedMatrix.push(row);
            }

        for (let i = 0; i < TILECNT; i++) {
            for (let j = 0; j < TILECNT; j++) {

                if(this.board[i][j] === GoTile.Empty){
                    let break_flag = false
                    for (let k = 0; k < 4; k++) {
                        // Four directions
                    let neighbour = ToDirection([i, j], this.DIRECTIONS[k]);
                    // console.log(neighbour)
                    if (out_boundary(neighbour[0], neighbour[1]))
                        continue;   
                    
                    if(initializedMatrix[neighbour[0]][neighbour[1]] === 1){
                        legal_actions.push([i, j])
                        // console.log("legal action: " + [i, j])
                        break_flag = true
                        break;
                    }
                }

                if (break_flag){
                    continue;
                }
                    // let air_cnt = this.get_air_cnt([i, j], this.current_player())
                    let air_result = this.get_air_cnt_position([i, j], this.current_player())
                    let air_pos = air_result.playerPositions;
                    // console.log(air_result.playerPositions);
                    for (const pos of air_pos) {
                        initializedMatrix[pos[0]][pos[1]] = 1;
                    }

                    let air_cnt = air_result.airCount

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

    islegalaction(pos){
        i = pos[0]
        j = pos[1]
        if(this.board[i][j] === GoTile.Empty){
            for (let k = 0; k < 4; k++) {
                // Four directions
            let neighbour = ToDirection([i, j], this.DIRECTIONS[k]);
            // console.log(neighbour)
            if (out_boundary(neighbour[0], neighbour[1]))
                return false;
            
            if(initializedMatrix[neighbour[0]][neighbour[1]] === 1){
                return true
            }
        }

            // let air_cnt = this.get_air_cnt([i, j], this.current_player())
            let air_result = this.get_air_cnt_position([i, j], this.current_player())
            let air_pos = air_result.playerPositions;
            // console.log(air_result.playerPositions);
            for (const pos of air_pos) {
                initializedMatrix[pos[0]][pos[1]] = 1;
            }

            let air_cnt = air_result.airCount

            if(air_cnt >=0){
                return true
            }
            const board_backup = JSON.parse(JSON.stringify(this.board))
            this.board[i][j] = this.current_player()
            let have_cleared = this.clear_dead_piece()

            if(!have_cleared && air_cnt === 0){
                //只有在没有清除敌方棋子并且当前格子没有气的时候才不让下该地方
                // No Air
                this.board = board_backup
                return false
            }

            if(this.play_histroy.includes(this.toString())){
                // Jie Happened
                this.board = board_backup
                return false
            }
            this.board = board_backup
            return true

        }

        return false
        
    }

    clear_dead_piece(){

        let matrixSize = 8;
        let initializedMatrix = [];

            for (let i = 0; i < matrixSize; i++) {
                let row = new Array(matrixSize).fill(0);
                initializedMatrix.push(row);
            }
            // 是否只需要考虑当前下的旗子四个方向的旗？
        let have_cleared = false
        for (let i = 0; i < TILECNT; i++) {
            for (let j = 0; j < TILECNT; j++) {
                const element = this.board[i][j]
                if (initializedMatrix[i][j] === 1){
                    continue;
                }
                if(element === this.opposite_player()){
                    // let air = this.get_air_cnt([i, j], this.opposite_player())
                    let air_result = this.get_air_cnt_position([i, j], this.opposite_player())
                    let air = air_result.airCount
                    let air_pos = air_result.playerPositions
                    for (const pos of air_pos) {
                        initializedMatrix[pos[0]][pos[1]] = 1;
                    }
                    if(air === 0)
                    {
                        for (const pos of air_pos) {
                            this.board[pos[0]][pos[1]] = GoTile.Empty
                        }
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
        // false| Now wins, GoTile.Black| Black wins, GoTile.White| White wins, 999| Draw
        if(!this.end)   return false
        let [black, white] = this.area()
        if (black - white - komi === 0){
            //draw
            return 999
        }
        return black - white - komi > 0 ? GoTile.Black : GoTile.White
    }

    check_win_no_end(komi = 0){
        // false| Now wins, GoTile.Black| Black wins, GoTile.White| White wins, 999| Draw
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
        const get_air_cnt_in = (position, player) => {
            const stack = [position]
            const result = {airCount: 0, playerPositions: [] };
            const visited_nodes = new Set()

            const stringifyPosition = pos => `${pos[0]},${pos[1]}`;

            visited_nodes.add(stringifyPosition(position))
            while (stack.length>0){
                const currentPos = stack.pop();

                if(out_boundary(currentPos[0], currentPos[1])){
                    continue
                }

                const current_tile = this.board[currentPos[0]][currentPos[1]]

                if(current_tile === GoTile.Empty){
                    result.airCount ++
                }else if(current_tile === player){
                    result.playerPositions.push(currentPos)
                    const neighbors = this.DIRECTIONS.map(direction => ToDirection(currentPos, direction))
                    for (const neighbor of neighbors) {
                        const strNeighbor = stringifyPosition(neighbor)
                        if(!out_boundary(neighbor[0], neighbor[1]) && !visited_nodes.has(strNeighbor)){
                            visited_nodes.add(strNeighbor)
                            stack.push(neighbor)
                        }
                    }
                }

            }
            return result
        }
        // console.log(get_air_cnt_in(position))
        return get_air_cnt_in(position, player)
    }

    get_air_cnt_position(position, player) {
        // console.log("air cnt of " + position)
        let visited_nodes = [JSON.stringify(position)]

        const get_air_cnt_in = (position, player) => {
            const stack = [position];
            const result = { airCount: 0, playerPositions: [] };
            const visited_nodes = new Set();
        
            const stringifyPosition = pos => `${pos[0]},${pos[1]}`;
        
            visited_nodes.add(stringifyPosition(position));
        
            while (stack.length > 0) {
                const currentPos = stack.pop();
        
                if (out_boundary(currentPos[0], currentPos[1])) {
                    continue;
                }
                const current_tile = this.board[currentPos[0]][currentPos[1]];
        
                if (current_tile === GoTile.Empty) {
                    result.airCount++;
                } else if (current_tile === player) {
                    result.playerPositions.push(currentPos);
                    const neighbors = this.DIRECTIONS.map(direction => ToDirection(currentPos, direction));
                    for (const neighbour of neighbors) {
                        const strNeighbour = stringifyPosition(neighbour);
                        if (!out_boundary(neighbour[0], neighbour[1]) && !visited_nodes.has(strNeighbour)) {
                            visited_nodes.add(strNeighbour);
                            stack.push(neighbour);
                        }
                    }
                }
            }
        
            return result;
        };
        // console.log(get_air_cnt_in(position))
        return get_air_cnt_in(position, player)
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

function GameMoveCopy(gamemove) {
    return new GameMove(gamemove.player, gamemove.position);
}

class GameMove {
    constructor(player, position) {
        this.player = player;
        this.position = position;
    }

    copy() {
        return new GameMove(this.player, this.position);
    }
}

function GameNodeGoCopy(gamenode) {
    const new_game_node = new GameNodeGo(gamenode.move === null ? null : GameMoveCopy(gamenode.move), gamenode.go == null ? null : gamenode.go);
    new_game_node.value = gamenode.value;
    new_game_node.simulations = gamenode.simulations;
    return new_game_node;
}

class GameNodeGo {
    constructor(move, go) {
        this.go = go;
        this.move = move
        this.value = 0;
        this.simulations = 0;
        this.winner = 0
    }

    copy() {
        const new_game_node = new GameNodeGo(this.move === null ? null : GameMoveCopy(this.move), this.go == null ? null : this.go);
        new_game_node.value = this.value;
        new_game_node.simulations = this.simulations;
        new_game_node.winner = this.winner
        return new_game_node;
    }
}

function UCB1(node, parent) {
    let exploitation = node.data.value / node.data.simulations;
    let exploration = Math.sqrt(2 * Math.log(parent.data.simulations) / node.data.simulations);
    return exploitation + exploration;
}

class GoMCTS {
    constructor(model, player = GoTile.Black) {
        this.model = model
        let root = new Node(new GameNodeGo(new GameMove(player, null), GoCopy(model)))
        this.tree = new Tree(root)
    }

    runSearch(iterations = 50) {
        // let end = Date.now() + timeout * 1000;
        let trace = [];

        // while (Date.now() < end) {
        for (let i = 0; i < iterations; i++) {
            let iterationTrace = this.runSearchIteration();
            trace.push(iterationTrace);
        }

        let best_move_node = this.tree.getChildren(this.tree.get(0)).reduce((a, b) => a.data.simulations > b.data.simulations ? a : b);
        trace.push([new AlgAction("finish", best_move_node.id, null, null)]);
        console.log(`Iteration: ${iterations}. Step: ${this.totalStep} Run Time: ${this.simulationTime} / ${this.totalTime}`)
        return {move: best_move_node.data.move, trace: trace};
    }

    totalTime = 0
    simulationTime = 0
    totalStep = 0

    runSearchIteration() {
        const startTime = performance.now()
        let selectRes = this.select(GoCopy(this.model));
        let selectLeaf = selectRes.node;
        let selectModel = selectRes.model;
        let selectActions = selectRes.actions;

        let expandRes = this.expand(selectLeaf, selectModel);
        let expandLeaf = expandRes.node;
        let expandModel = expandRes.model;
        let expandActions = expandRes.actions;

        const startSimulationTime = performance.now()
        let simulation = this.simulate(expandLeaf);
        let simulationActions = simulation.actions;

        this.simulationTime += performance.now() - startSimulationTime

        let backpropagated = this.backpropagate(expandLeaf, simulation);
        let backpropagatedActions = backpropagated.actions;

        this.totalTime += performance.now() - startTime
        return selectActions.concat(expandActions.concat(simulationActions.concat(backpropagatedActions)));
    }

    getBestChildUCB1(node) {
        let nodeScores = this.tree.getChildren(node).map((f) => [f, UCB1(f, node)]);
        return nodeScores.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    select() {
        let node = this.tree.get(0);
        let actions = [new AlgAction("selection", node.id, null, null)];
        
        // while (!node.isLeaf() && this.isFullyExplored(node)) {
        //     node = this.getBestChildUCB1(node);
        //     //在原本的mcts中每一步都需要用到move来得到当前棋盘信息
        //     // node.data.go.makeMove(node.data.move);
        //     actions.push(new AlgAction("selection", node.id, null, null));
        // }


        if (!node.explored) {
            node.explored = this.isFullyExplored(node)
        }
        while (!node.isLeaf() && node.explored) {
            node = this.getBestChildUCB1(node);
            if (!node.explored) {
                node.explored = this.isFullyExplored(node)
            }

            //在原本的mcts中每一步都需要用到move来得到当前棋盘信息
            // node.data.go.makeMove(node.data.move);
            actions.push(new AlgAction("selection", node.id, null, null));
        }


        return {node: node, model: node.data.go, actions: actions};
    }

    expand(node) {
        let expandedNode = null;
        let actions = [];
        let model = node.data.go
        let model2 = null
        if (model.checkWin() === false) {
            let legalPositions = this.getAvailablePlays(node);
            // let randomPos = legalPositions[myp5.round(myp5.random(legalPositions.length - 1))];
            let otherPlayer = getOtherPlayer(node.data.move.player);
            let randomMove = new GameMove(otherPlayer ,legalPositions[Math.floor(Math.random() * legalPositions.length)]);

            model2 = GoCopy(model)
            model2.makeMove(randomMove);

            expandedNode = new Node(new GameNodeGo(randomMove, model2));
            this.tree.insert(expandedNode, node);

            actions = [new AlgAction("expansion", expandedNode.id, null, null)];
        } else {
            expandedNode = node;
        }

        return {
            node: expandedNode,
            model: model2,
            actions: actions
        };
    }

    simulate(node) {
        // let simulateNode = new Node(new GameNode(randomMove, model2));
        let model = GoCopy(node.data.go)
        let step = 0
        let currentPlayer = node.data.move.player

        // let lastStepDis = model.checkBoxDistance()
        let reward = 0
        // console.log("start")
        while (model.checkWin() === false) {

            currentPlayer = getOtherPlayer(currentPlayer)

            model.makeRandomMove()
            step++

            if(step>=50){
                break
            }
        }

        this.totalStep += step

        // console.log(reward, "===================================================")

        // let winner_icon = model.checkWin()
        const winner_icon = model.check_win_no_end()
        // console.log(winner_icon)

        return {
            winner_icon: winner_icon,
            step_used: step,
            actions: [new AlgAction("simulation", node.id, null, {
                "result": winner_icon,
                "board": model
            })],
            reward: reward
        };
    }

    backpropagate(node, simulation, step = 0) {
        let winner = simulation.winner_icon
        let actions = [];
        let action = new AlgAction("backpropagation", node.id, {
            old_value: node.data.value,
            old_visits: node.data.simulations
        }, null);

        node.data.simulations += 1;
        node.data.winner_icon = winner


        // node.data.value -= node.data.go.checkBoxDistance()*0.000001
        // node.data.value += node.data.go.checkFilledHoles()
        // node.data.value -= step*0.01

        // console.log(node.data)
        if ((node.data.move.player === GoTile.White && winner === GoTile.White) ||
            (node.data.move.player === GoTile.Black && winner === GoTile.Black)) {
            node.data.value -= 1;
        }
        if ((node.data.move.player === GoTile.White && winner === GoTile.Black) ||
            (node.data.move.player === GoTile.Black && winner === GoTile.White)) {
            node.data.value += 1;
        }


        if (!node.isRoot()) {
            actions = actions.concat(this.backpropagate(this.tree.getParent(node), simulation, step + 1).actions);
        }

        action.new_data = {
            new_value: node.data.value,
            new_visits: node.data.simulations
        };

        actions.unshift(action);

        return {actions: actions};
    }

    isFullyExplored(node) {
        return this.getAvailablePlays(node).length === 0;
    }
    //
    // constructChildrenBoard(node){
    //     const children_board = {}
    //     const children = this.tree.getChildren(node)
    //
    // }


    getAvailablePlays(node){
        let parent_go = node.data.go
        let children = this.tree.getChildren(node)
        // return parent_go.get_legal_action()
        // if (node.legal_actions.length===0){
        //     node.legal_actions = parent_go.get_legal_action()
        //     console.log("get legal action")
        // }

        // if (!(children.length === 0)){
        //     console.log("children")
        // }
        return parent_go.get_legal_action().filter((dir) => {
            const parent_go_copy = GoCopy(parent_go)
            parent_go_copy.make_quick_action({position: dir})
            // const explored = children.find((child) => child.data.go.board.toString() === parent_go_copy.board.toString());
            const explored = children.find((child) => child.data.move.position[0] === dir[0] && child.data.move.position[1] === dir[1]);
            return !explored;
        });
    }

}