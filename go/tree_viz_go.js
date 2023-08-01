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
    };

        s.originDraw = s.draw

    s.draw = () => {
        s.originDraw()
        s.mctsTimeoutSpan.html(s.mctsTimeoutSlider.value());
    }

    s.drawGame = (board) => {
        s.fill(0);
        board = board.board
        let tile_size = node_size.x / board.length;

        s.translate(15, 15);

        if(board)
            s.lastBoard = board
        else
            board = s.lastBoard

        let tileNum = Math.max(board.length, board[0].length)
        s.tileSize = (s.width - 20) / tileNum;
        s.clear()


        s.strokeWeight(1.5)

        //draw the base board

        for (let i = 0; i < tileNum; i++) {
            for (let j = 0; j < tileNum; j++) {
                if (i !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, (i + 1) * s.tileSize, j * s.tileSize)
                if (j !== tileNum - 1)
                    s.line(i * s.tileSize, j * s.tileSize, i * s.tileSize, (j + 1) * s.tileSize)
                let radius = 4

                switch (board[i][j]) {
                    case GoTile.Empty:
                        s.fill(0)
                        if (i === s.hoveredTile[0] && j === s.hoveredTile[1]) {
                            s.fill(122)
                            radius = 15
                        }
                        break;
                    case GoTile.Black:
                        s.fill(0)
                        radius = 20
                        break;
                    case GoTile.White:
                        s.fill(255)
                        radius = 20
                        break;
                }
                s.circle(i * s.tileSize, j * s.tileSize, radius)
            }
        }

        s.pop()

        if(s.go === null) return

        if(s.go.end){
            s.text(`Winner is: ${s.go.winner === 999? "Draw": s.go.winner === GoTile.White? "White":"Black"}`, 15, 190)
        }else{
            s.text(`Current Player: ${s.go.current_player() === GoTile.White? "White": "Black"}`, 15, 190)
        }
    }
}