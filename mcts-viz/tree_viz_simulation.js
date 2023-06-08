import {vis} from "./tree_vis.js";

const Player = {
    0: "Player A",
    1: "Player B"
}

export const vis_four = (s) => {

    vis(s)

    let node_size = {x: 50, y: 55};

    const show_txt = node_size.x * 1.8


    s.drawNode = (board, value, visits, node) => {
        if (node.data.simulated_board) {
            board = node.data.simulated_board;
        }

        let tile_size = node_size.x / 3;


        if (node.id == s.hovered_node_id) {
            s.fill(200);
        } else {
            s.fill(255)
        }

        if (node.data.best_move) {
            s.strokeWeight(2);
            s.stroke(255, 0, 0);
        }

        if (s.show_simple) {
            s.rect(0, 0, node_size.x, node_size.y, 5);
        } else {
            s.rect(0, 0, node_size.x + show_txt, node_size.y, 5);
        }


        if (node.data.best_move) {
            s.strokeWeight(0.5);
            s.stroke(0);
        }

        s.drawGame(board)


        s.push();
        s.textSize(tile_size * 0.8);

        // s.translate(0, (node_size.y - node_size.x) / 10);
        s.translate(node_size.x, 0);

        const text_width = 45

        value = value.toFixed(1)
        if (!node.isRoot()) {
            let uct = UCB1(node, s.tree.getParent(node)).toFixed(2);
            if (isNaN(uct)) {
                uct = "--";
            }


            if (node === s.hovered_node) {
                node.uct_txt = uct
                node.vis_txt = visits
                node.val_txt = value
            }

            if (!s.show_simple) {

                s.textAlign(s.LEFT, s.TOP);
                s.text(" val: ", 0, 0);
                s.text(" vis: ", 0, (node_size.y) / 4);
                s.text(" uct: ", 0, 2 * (node_size.y) / 4);
                s.textAlign(s.RIGHT, s.TOP);
                s.text("  " + value + " ", text_width + node_size.x, 0);
                s.text("  " + visits + " ", text_width + node_size.x, (node_size.y) / 4);
                s.text("  " + uct + " ", text_width + node_size.x, 2 * (node_size.y) / 4);
            }
        } else {
            if (node === s.hovered_node) {
                node.vis_txt = visits
                node.val_txt = value
            }
            if (!s.show_simple) {

                s.textAlign(s.LEFT, s.TOP);
                s.text(" val: ", 0, 0);
                s.text(" vis: ", 0, (node_size.y) / 4);
                s.textAlign(s.RIGHT, s.TOP);
                s.text("  "+value + " ", text_width + node_size.x, 0);
                s.text("  " + visits + " ", text_width + node_size.x, (node_size.y) / 4);
            }

            // s.textAlign(s.LEFT, s.CENTER);
            // s.text(" vis:", 0, 0);
            // s.textAlign(s.RIGHT, s.CENTER);
            // s.text(visits + " ", 0, 0);
        }


        s.pop();

        if (node.data.simulated_board) {
            let winner_icon = node.data.simulated_board.checkWin();
            s.text(winner_icon === "v" ? "DRAW" : (" WINNER: " + Player[node.data.move.player]), 0, node_size.y * 1.25);
        }
    }
}

export const vis_simulation = (s) => {
    vis(s)

    s.show_simple = true;

    let node_size = {x: 50, y: 55};

    const show_txt = node_size.x * 1.8

    s.originSetup = s.setup

    s.setup = () => {
        s.originSetup()
        s.checkBox.remove()
    };

    s.updateNodeInfo = () => {

    }

    s.drawNode = (board, value, visits, node) => {
        s.show_simple = true

        if (node.data.simulated_board) {
            board = node.data.simulated_board;
        }

        if (node.id == s.hovered_node_id) {
            s.fill(200);
        } else {
            s.fill(255)
        }

        if (node.data.best_move) {
            s.strokeWeight(2);
            s.stroke(255, 0, 0);
        }

        if (s.show_simple) {
            s.rect(0, 0, node_size.x, node_size.y, 5);
        } else {
            s.rect(0, 0, node_size.x + show_txt, node_size.y, 5);
        }


        if (node.data.best_move) {
            s.stroke(0);
        }

        s.drawGame(board)


        if (node.data.simulated_board) {
            s.push()
            s.strokeWeight(0.5);
            s.translate(node_size.x, 0);
            let winner_icon = node.data.simulated_board.checkWin();
            if (winner_icon === "") {
                s.text(` ${Player[node.data.move.player]}`, 0, node_size.y * 0.5)
            } else {
                s.text(winner_icon === "v" ? "DRAW" : (" WINNER: " + Player[node.data.move.player]), 0, node_size.y * 0.5);
            }
            s.pop()

        }

    }

}