import {vis} from "./tree_vis.js";

const Player = {
    0: "Human",
    1: "AI"
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
                s.text(` Current Player: ${Player[node.data.move.player]}`, 0, node_size.y * 0.5)
            } else {
                s.text(winner_icon === "v" ? "DRAW" : (" WINNER: " + winner_icon), 0, node_size.y * 0.5);
            }
            s.pop()

        }

    }

}