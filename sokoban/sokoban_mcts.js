// class AlgAction {
//     constructor(kind, node_id, old_data, new_data) {
//         this.kind = kind;
//         this.node_id = node_id;
//         this.old_data = old_data;
//         this.new_data = new_data;
//     }
// }

Array.prototype.indexOf = function (val) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
}

Array.prototype.remove = function (val) {
    let index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1)
    }
}

class GameNodeSokoban {
    constructor(move, sokoban) {
        this.sokoban = sokoban;
        this.move = move
        this.value = 0;
        this.simulations = 0;
    }

    copy() {
        const new_game_node = new GameNodeSokoban(this.move == null ? null : this.move, this.sokoban == null ? null : this.sokoban);
        new_game_node.value = this.value;
        new_game_node.simulations = this.simulations;
        return new_game_node;
    }
}

function UCB1(node, parent) {
    let exploitation = node.data.value / node.data.simulations;
    let exploration = Math.sqrt(2 * Math.log(parent.data.simulations) / node.data.simulations);
    return exploitation + exploration;
}

class SokobanMCTS {
    constructor(model) {
        this.model = model
        let root = new Node(new GameNodeSokoban(null, model.copy()));
        this.tree = new Tree(root);
        this.stepPenalty = 5
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
            // node.data.sokoban.makeMove(node.data.move);
            actions.push(new AlgAction("selection", node.id, null, null));
        }

        return {node: node, model: node.data.sokoban, actions: actions};
    }

    expand(node) {
        let expandedNode = null;
        let actions = [];
        let model = node.data.sokoban
        let model2 = null
        if (model.checkWin() === false) {
            let legalPositions = this.getAvailablePlays(node);
            // let randomPos = legalPositions[myp5.round(myp5.random(legalPositions.length - 1))];
            let randomMove = legalPositions[Math.floor(Math.random() * legalPositions.length)];

            model2 = model.copy()
            model2.makeMove(randomMove);

            expandedNode = new Node(new GameNodeSokoban(randomMove, model2));
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
        let model = node.data.sokoban.copy()
        let step = 0

        let lastStepDis = model.checkBoxDistance()
        let reward = 0
        // console.log("start")
        while (model.checkWin() === false) {
            model.makeRandomMove()
            step++

            let newStepDis = model.checkBoxDistance()

            reward += lastStepDis - newStepDis * 0.9
            // console.log(lastStepDis, newStepDis, reward)

            lastStepDis = newStepDis

            if(step>=1000){
                break
            }
        }

        // console.log(reward, "===================================================")

        let winner_icon = model.checkWin()


        return {
            winner_icon: winner_icon,
            win_step: model.checkFilledHoles(),
            box_distance: model.checkBoxDistance(),
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


        // node.data.value -= node.data.sokoban.checkBoxDistance()*0.000001
        // node.data.value += node.data.sokoban.checkFilledHoles()
        node.data.value -= step*0.01

        if(winner === true){
            node.data.value += 1
        }

        // node.data.value += simulation.reward * 0.01
        // else{
        //     node.data.value -= 1
        // }


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
        let parent_sokoban = node.data.sokoban
        let children = this.tree.getChildren(node)
        // let children = this.tree.getSiblings(node)
        // let children = this.tree.getChildren(this.tree.get(0))
        //避免把自己也给算进去
        // children.remove(node)

        //重复的play情况是箱子和player位置一样
        return parent_sokoban.get_legal_action().filter((dir) => {
            let parent_sokoban_copy = parent_sokoban.copy()
            parent_sokoban_copy.make_action(dir)
            //判断整个棋盘是否相等
            let explored = children.find((child) => child.data.sokoban.board.toString() === parent_sokoban_copy.board.toString());
            return !explored;
        });
    }

    //parent状态也有可能会出现，所以在这里的children并不能只是node的children
    getAvailablePlays2(node) {
        let parent = null
        if (node !== this.tree.getRoot()) {
            parent = this.tree.getParent(node)
        }
        let parent_sokoban = node.data.sokoban
        let children = this.tree.getChildren(node)

        let available_play = parent_sokoban.get_legal_action().filter((pos) => {
            let explored = children.find((child) => child.data.move === pos);
            return !explored;
        })
        //如果只剩下一条路可走，就走这一条路
        if (available_play.length <= 1) return available_play
        //否则就不允许走回头路
        return available_play.filter((dir) => {
            if (parent === null) return true
            let current_tmp = node.data.sokoban.copy()
            current_tmp.make_action(dir)

            return !(current_tmp.board.toString() === parent.data.sokoban.board.toString())
        });
    }
}

