import {vis} from "../mcts-viz/tree_vis.js";
import {GoTile} from "./go.js";

export const viz_go= (s)=>{

    let tree = null;
    let initial_board = null;

    let zoom = 1.00;
    let zMin = 0.05;
    let zMax = 9.00;
    let sensitivity = 0.001;
    let offset = {"x": 20, "y": 20, zoom: 1};
    let dragging = false;
    let lastMouse = {"x": 0, "y": 0};
    let hovered_node_id = -1;
    let hovered_node = null
    let hovered_node_pos = {x: 0, y: 0};

    let node_distance = {x: 0.75, y: 0.75};

    let node_size = {x: 50, y: 90};

    const show_txt = node_size.x * 1.8


    vis(s)

    s.originSetup = s.setup

    s.setup = () => {
        s.originSetup()
        let canvas_id = s._userNode.id
        s.mctsTimeoutSlider = s.select("#" + canvas_id + "_" + "mcts_timeout_slider");
        s.mctsTimeoutSpan = s.select("#" + canvas_id + "_" + "mcts_timeout_span");

        s.canvas_div = s._userNode
    }

    s.originDraw = s.draw

    s.draw = () => {
        s.originDraw()
        const value = s.mctsTimeoutSlider.value()
        if(value <= 1000){
            s.mctsTimeoutSpan.html(s.mctsTimeoutSlider.value() +" iterations " + "(visualisation)")
            document.getElementById("go_tree").style.display = ""
        }else{
            s.mctsTimeoutSpan.html(s.mctsTimeoutSlider.value() +" iterations " +" (expert)")
            document.getElementById("go_tree").style.display = "none"
        }

    }

    s.drawGame = (board) => {
        s.push()
        board = board.board
        s.translate(4, 4);

        let tile_size = node_size.x / board.length;

        s.strokeWeight(1)
        //draw the base board
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (i !== board.length - 1)
                    s.line(i * tile_size, j * tile_size, (i + 1) * tile_size, j * tile_size)
                if (j !== board[0].length - 1)
                    s.line(i * tile_size, j * tile_size, i * tile_size, (j + 1) * tile_size)
                let radius = 0
                switch (board[i][j]) {
                    case GoTile.Empty:
                        s.fill(0)
                        break;
                    case GoTile.Black:
                        s.fill(0)
                        radius = 4
                        break;
                    case GoTile.White:
                        s.fill(255)
                        radius = 4
                        break;
                }
                s.circle(i * tile_size, j * tile_size, radius)
            }
        }
        s.fill(0)
        if(s.go === null || s.go === undefined) {
            s.pop()
            return
        }

        s.fill(0)

        // if(s.go.end){
        //     s.text(`Winner is: ${s.go.winner === 999? "Draw": s.go.winner === GoTile.White? "White":"Black"}`, 15, 190)
        // }else{
        //     s.text(`Current Player: ${s.go.current_player() === GoTile.White? "White": "Black"}`, 15, 190)
        // }
        s.pop()
    }

    s.drawWinnner = (node, node_size)=>{
        if (node.data.simulated_board) {
            s.fill(0)
            let winner_icon = 0
            // if(node.data.winner_icon){
            //     winner_icon = node.data.winner_icon
            // }else{
            //     console.log(node.data.winner_icon.a1234)
                // winner_icon = node.data.simulated_board.checkWin()
            winner_icon = node.data.simulated_board.check_win_no_end()
            // }
            let winner = ""
            switch (winner_icon) {
                case GoTile.Black:
                    winner = "Winner: Black"
                    break
                case GoTile.White:
                    winner = "Winner: White"
                    break
                case GoTile.Empty:
                    winner = "Unknown"
                    break
                case 999:
                    winner = "Draw"
                    break
                case false:
                    winner = "Continue"
                    break
                default:
                    winner = "???"
                    break
            }
            s.text(winner, 0, node_size.y * 1.25);
        }
    }
}