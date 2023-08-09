import {GoTile} from "./go.js";
import {GoCopy, GameMove, GameNodeGo, TreeCopy} from "./GoUtil.js";
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



function UCB1(node, parent) {
    let exploitation = node.data.value / node.data.simulations;
    let exploration = Math.sqrt(2 * Math.log(parent.data.simulations) / node.data.simulations);
    return exploitation + exploration;
}

export function FromMCTS(origin_mcts){
    let result = new GoMCTS(origin_mcts.model)
    result.tree = TreeCopy(origin_mcts.tree)
    return result
}

export default class GoMCTS {
    constructor(model, player = GoTile.Black) {
        this.model = model
        let root = new Node(new GameNodeGo(new GameMove(player, null), GoCopy(model)));
        this.tree = new Tree(root);
    }

    async runSearch(iterations = 50) {
        // let end = Date.now() + timeout * 1000;
        let trace = [];

        // while (Date.now() < end) {
        for (let i = 0; i < iterations; i++) {
            let iterationTrace = this.runSearchIteration();
            trace.push(iterationTrace);
        }

        let best_move_node = this.tree.getChildren(this.tree.get(0)).reduce((a, b) => a.data.simulations > b.data.simulations ? a : b);
        trace.push([new AlgAction("finish", best_move_node.id, null, null)]);
        return {move: best_move_node.data.move, trace: trace};
    }

    runSearchIteration() {
        let selectRes = this.select(this.model.copy());
        let selectLeaf = selectRes.node;
        let selectModel = selectRes.model;
        let selectActions = selectRes.actions;

        let expandRes = this.expand(selectLeaf, selectModel);
        let expandLeaf = expandRes.node;
        let expandModel = expandRes.model;
        let expandActions = expandRes.actions;

        let simulation = this.simulate(expandLeaf);
        let simulationActions = simulation.actions;

        let backpropagated = this.backpropagate(expandLeaf, simulation);
        let backpropagatedActions = backpropagated.actions;

        return selectActions.concat(expandActions.concat(simulationActions.concat(backpropagatedActions)));
    }

    getBestChildUCB1(node) {
        let nodeScores = this.tree.getChildren(node).map((f) => [f, UCB1(f, node)]);
        return nodeScores.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    select() {
        let node = this.tree.get(0);
        let actions = [new AlgAction("selection", node.id, null, null)];

        while (!node.isLeaf() && this.isFullyExplored(node)) {
            node = this.getBestChildUCB1(node);
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

            model2 = model.copy()
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
        let model = node.data.go.copy()
        let step = 0
        let currentPlayer = node.data.move.player

        // let lastStepDis = model.checkBoxDistance()
        let reward = 0
        // console.log("start")
        while (model.checkWin() === false) {

            currentPlayer = getOtherPlayer(currentPlayer)

            model.makeRandomMove()
            step++

            if(step>=100){
                break
            }
        }

        // console.log(reward, "===================================================")

        // let winner_icon = model.checkWin()
        const winner_icon = model.check_win_no_end(0)


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


        // node.data.value -= node.data.go.checkBoxDistance()*0.000001
        // node.data.value += node.data.go.checkFilledHoles()
        node.data.value -= step*0.01

        // console.log(node.data)
        if ((node.data.move.player === GoTile.White && winner === GoTile.White) ||
            (node.data.move.player === GoTile.Black && winner === GoTile.Black)) {
            node.data.value += 1;
        }
        if ((node.data.move.player === GoTile.White && winner === GoTile.Black) ||
            (node.data.move.player === GoTile.Black && winner === GoTile.White)) {
            node.data.value -= 1;
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


    getAvailablePlays(node){
        let parent_go = node.data.go
        let children = this.tree.getChildren(node)
        return parent_go.get_legal_action().filter((dir) => {
            let parent_go_copy = parent_go.copy()
            parent_go_copy.make_action({position: dir})
            let explored = children.find((child) => child.data.go.board.toString() === parent_go_copy.board.toString());
            return !explored;
        });
    }

}

