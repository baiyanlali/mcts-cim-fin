// import {VisualizationStates} from "../mcts-viz/interactive";

class SokobanInteractive {
    initial_board = undefined;
    action_trace = [];
    best_move = null;

    currentActionIdx = -1;
    currentIterationIdx = -1;
    totalActionsTillNow = 0;

    final_tree = undefined;
    reconstructed_tree = undefined;
    draw_tree = undefined;


    current_vis_state = 0;

    constructor(tree_vis_p5, id, my_p5) {
        this.tree_vis_p5 = tree_vis_p5
        this.tree_vis_p5.setInteractive(this)
        this.id = id
        this.myp5 = my_p5
    }


    transitionToState(new_state) {
        this.current_vis_state = new_state;

        switch (new_state) {
            case VisualizationStates.NONE:
                this.currentActionIdx = 0;
                this.currentIterationIdx = 0;
                this.totalActionsTillNow = 0;
                this.updateInterface();
                this.sendDrawTree(null);

                document.getElementById(this.id+"_"+"btn_next_iteration").disabled = true;
                document.getElementById(this.id+"_"+"btn_next_action").disabled = true;
                document.getElementById(this.id+"_"+"btn_last_step").disabled = true;
                document.getElementById(this.id+"_"+"btn_make_play").disabled = true;
                break;
            case VisualizationStates.VISUALIZING:
                document.getElementById(this.id+"_"+"btn_next_iteration").disabled = false;
                document.getElementById(this.id+"_"+"btn_next_action").disabled = false;
                document.getElementById(this.id+"_"+"btn_last_step").disabled = false;
                document.getElementById(this.id+"_"+"btn_make_play").disabled = false;
                break;
            case VisualizationStates.LAST_STEP:
                document.getElementById(this.id+"_"+"btn_next_iteration").disabled = true;
                document.getElementById(this.id+"_"+"btn_next_action").disabled = true;
                document.getElementById(this.id+"_"+"btn_last_step").disabled = true;
                document.getElementById(this.id+"_"+"btn_make_play").disabled = false;
                break;
        }
    }


    setupInteractive() {
        document.getElementById(this.id+"_"+"btn_next_action").addEventListener("click", this.clickNextAction);
        document.getElementById(this.id+"_"+"btn_next_iteration").addEventListener("click", this.clickNextIteration);
        document.getElementById(this.id+"_"+"btn_last_step").addEventListener("click", this.clickVisualizeLastStep);
        document.getElementById(this.id+"_"+"btn_make_play").addEventListener("click", this.clickMakePlay);
        this.transitionToState(VisualizationStates.NONE);
    }


    setMCTS(mcts_obj, trace) {
        this.initial_board = mcts_obj.model.copy();
        this.action_trace = trace.trace;
        this.best_move = trace.move;

        this.final_tree = mcts_obj.tree.copy();
        this.reconstructed_tree = new Tree(new Node(new GameNodeSokoban(null, this.initial_board)));
        this.draw_tree = this.makeDrawTree(this.reconstructed_tree);

        this.tree_vis_p5.initial_board = this.initial_board;

        let action = this.action_trace[0][0];
        this.applyAction(action);

        this.transitionToState(VisualizationStates.VISUALIZING);
        this.draw_tree = this.makeDrawTree(this.reconstructed_tree);
        this.sendDrawTree(this.draw_tree);

        this.tree_vis_p5.focusNode(this.tree_vis_p5.tree.getRoot());
    }


    sendDrawTree(tree) {
        this.updateInterface();
        this.tree_vis_p5.updateTree(tree);
    }


    updateInterface() {
        let action_kind = "---";
        let action_progress_bar = "(-/-)";
        let iteration_progress_bar = "(-/-)";

        if (this.current_vis_state !== VisualizationStates.NONE) {
            action_kind = this.action_trace[this.currentIterationIdx][this.currentActionIdx].kind;
            action_progress_bar = "(" + this.totalActionsTillNow + "/" + (this.action_trace.flat().length - 1) + ")";
            iteration_progress_bar = "(" + this.currentIterationIdx + "/" + (this.action_trace.length - 1) + ")";
        }

        document.getElementById(this.id+"_"+"current_action_kind").innerHTML = action_kind;
        document.getElementById(this.id+"_"+"current_action_kind").className = action_kind;
        document.getElementById(this.id+"_"+"current_action_count").innerHTML = action_progress_bar;
        document.getElementById(this.id+"_"+"current_iteration_count").innerHTML = iteration_progress_bar;
    }


    makeDrawTree(tree) {
        let d_tree = tree.copy();

        d_tree.nodes.forEach((f) => {
            if (!f.isLeaf()) f.data.should_show_collapse_btn = true;
        })

        while (true) {
            for (var i = 0; i < d_tree.nodes.length; i++) {
                let parent = d_tree.getParent(d_tree.get(i));
                if (parent && parent.data.collapsed) {
                    d_tree.remove(d_tree.get(i));
                    i = 0;
                }
            }
            break;
        }

        return prepareTree(d_tree, {min_distance: 1});
    }


    applyAction(action) {
        this.reconstructed_tree.nodes.forEach((f) => {
            f.data.backpropagated = false;
            f.data.simulated = false;
            f.data.selected = false;
            f.data.expanded = false
        });

        switch (action.kind) {
            case "selection":
                this.reconstructed_tree.nodes.forEach((f) => {
                    if (f.data.simulated_board) {
                        this.reconstructed_tree.getParent(f).data.should_show_collapse_btn = false;
                        this.reconstructed_tree.remove(f);
                    }
                })
                this.reconstructed_tree.get(action.node_id).data.selected = true;
                break;
            case "expansion":
                let parent = this.reconstructed_tree.get(this.final_tree.getParent(this.final_tree.get(action.node_id)).id);
                this.reconstructed_tree.insert(new Node(new GameNodeSokoban(this.final_tree.get(action.node_id).data.move, this.final_tree.get(action.node_id).data.sokoban.copy())), parent);
                this.reconstructed_tree.get(action.node_id).data.action_id = this.totalActionsTillNow;
                this.reconstructed_tree.get(action.node_id).data.expanded = true;
                this.reconstructed_tree.get(action.node_id).data.collapsed = false;
                break;
            case "simulation":
                // let simulated_node = new Node(new GameNode(this.reconstructed_tree.get(action.node_id).data.move, this.reconstructed_tree.get(action.node_id).data.sokoban.copy()));
                let simulated_node = new Node(new GameNodeSokoban(this.reconstructed_tree.get(action.node_id).data.move, action.new_data.board));
                simulated_node.data.simulated_board = action.new_data.board;
                simulated_node.data.simulated = true;
                this.reconstructed_tree.insert(simulated_node, this.reconstructed_tree.get(action.node_id));
                break;
            case "backpropagation":
                this.reconstructed_tree.get(action.node_id).data.backpropagated = true;
                this.reconstructed_tree.get(action.node_id).data.value = action.new_data.new_value;
                this.reconstructed_tree.get(action.node_id).data.simulations = action.new_data.new_visits;
                break;
            case "finish":
                let best_move_node = this.reconstructed_tree.get(action.node_id);
                best_move_node.data.best_move = true;
                break;
        }
    }

// CONTROL


    clickNextAction = (send_tree = true) => {
        if (this.isLastStep()) {
            this.transitionToState(VisualizationStates.LAST_STEP);
            return;
        }

        if (this.currentActionIdx === this.action_trace[this.currentIterationIdx].length - 1) {
            this.currentIterationIdx += 1;

            this.currentActionIdx = 0;
            this.totalActionsTillNow += 1;
        } else {
            this.currentActionIdx += 1;
            this.totalActionsTillNow += 1;
        }

        let action = this.action_trace[this.currentIterationIdx][this.currentActionIdx];
        this.applyAction(action);

        if (send_tree) {
            this.draw_tree = this.makeDrawTree(this.reconstructed_tree);
            this.sendDrawTree(this.draw_tree);

            this.transitionToState(VisualizationStates.VISUALIZING);
        }
    }


    clickNextIteration = (send_tree = true) => {
        if (this.isLastStep()) {
            this.transitionToState(VisualizationStates.LAST_STEP);
            return;
        }

        let iteration = this.action_trace[this.currentIterationIdx];
        for (var i = this.currentActionIdx; i < iteration.length - 1; i++) {
            this.clickNextAction(false);
        }

        this.clickNextAction(send_tree); //last action sends the tree if necessary
    }


    clickVisualizeLastStep = () => {
        for (var i = this.currentIterationIdx; i < this.action_trace.length; i++) {
            this.clickNextIteration(this.send_tree = false);
        }

        this.draw_tree = this.makeDrawTree(this.reconstructed_tree);

        this.draw_tree.nodes.forEach((node) => {
            let reconstructed_node = this.reconstructed_tree.nodes.find((f) => f.data.action_id == node.data.action_id);
            if (!reconstructed_node.isRoot()) {
                reconstructed_node.data.collapsed = true;
            }
        });

        this.draw_tree = this.makeDrawTree(this.reconstructed_tree);
        this.sendDrawTree(this.draw_tree);


        this.tree_vis_p5.focusNode(this.tree_vis_p5.tree.getRoot());
    }


    clickMakePlay = () => {
        this.myp5.makeMove(this.best_move);
        this.transitionToState(VisualizationStates.NONE);
    }


    isLastStep() {
        return this.currentIterationIdx === this.action_trace.length - 1
            && this.currentActionIdx === this.action_trace[this.action_trace.length - 1].length - 1;
    }


    toggleCollapse = (node) => {
        let reconstructed_node = this.reconstructed_tree.nodes.find((f) => f.data.action_id == node.data.action_id);
        reconstructed_node.data.collapsed = !reconstructed_node.data.collapsed;

        this.draw_tree = this.makeDrawTree(this.reconstructed_tree);
        this.sendDrawTree(this.draw_tree);

        this.tree_vis_p5.focusNode(node, true);
    }
}

