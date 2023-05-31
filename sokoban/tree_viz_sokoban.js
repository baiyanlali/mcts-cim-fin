import {SokobanTile} from "./sokoban.js";
import {vis} from "../mcts-viz/tree_vis.js";

export const vis_sokoban = (s) => {
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

    s.preload = () =>{
        s.box = s.loadImage('image/sokoban/Box.png')
        s.destination = s.loadImage('image/sokoban/Destination.png')
        s.player = s.loadImage('image/sokoban/Player.png')
        s.wall = s.loadImage('image/sokoban/Wall.png')
    };

    s.originSetup = s.setup

    s.setup = () => {
        s.originSetup()
        let canvas_id = s._userNode.id
        s.mctsTimeoutSlider = s.select("#"+canvas_id+"_"+"mcts_timeout_slider");
        s.mctsTimeoutSpan = s.select("#"+canvas_id+"_"+"mcts_timeout_span");

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
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                let tile = board[i][j];

                let object_on_current_tile = null

                switch (tile) {
                    case SokobanTile.Player:
                        object_on_current_tile = s.player
                        break
                    case SokobanTile.Wall:
                        object_on_current_tile = s.wall
                        break
                    case SokobanTile.Box:
                        object_on_current_tile = s.box

                        break
                    case SokobanTile.End:
                        object_on_current_tile = s.destination
                        break
                }

                if(object_on_current_tile!== null)
                    s.image(object_on_current_tile, j * tile_size, i * tile_size, tile_size, tile_size)
            }
        }
    }
};

// let tree_vis_sokoban_p5 = new p5(vis_sokoban, "tree_vis_sokoban");
