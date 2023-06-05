window.MyMCTS = class extends SokobanMCTS {

    constructor(model) {
        super(model);
    }

    select() {
        let node = this.tree.get(0);
        let actions = [new AlgAction("selection", node.id, null, null)];

        while (!node.isLeaf() && this.isFullyExplored(node)) {
            node = this.getBestChildUCB1(node);
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
            let randomMove = legalPositions[Math.floor(Math.random()*legalPositions.length)];

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
        let model = node.data.sokoban.copy()
        let step = 0

        while (model.checkWin() === false) {
            model.makeRandomMove()
            step ++

            if(step >= 1000){
                break
            }
        }


        let winner_icon = model.checkWin()


        return {
            winner_icon: winner_icon,
            win_step: model.checkFilledHoles(),
            box_distance: model.checkBoxDistance(),
            step_used: step,
            actions: [new AlgAction("simulation", node.id, null, {
                "result": winner_icon,
                "board": model
            })]
        };
    }

    backpropagate(node, simulation) {
        let step = simulation.step_used
        let winner = simulation.winner_icon
        let actions = [];
        let action = new AlgAction("backpropagation", node.id, {
            old_value: node.data.value,
            old_visits: node.data.simulations
        }, null);

        node.data.simulations += 1;
        if (!node.isRoot()) {

            if(winner===true){
                node.data.value -= step * 0.5
            }else{
                node.data.value -= 0.1
            }

            node.data.value += simulation.win_step * 10
            node.data.value -= simulation.box_distance

            actions = actions.concat(this.backpropagate(this.tree.getParent(node), simulation).actions);
        }

        action.new_data = {
            new_value: node.data.value,
            new_visits: node.data.simulations
        };

        actions.unshift(action);

        return {actions: actions};
    }

}