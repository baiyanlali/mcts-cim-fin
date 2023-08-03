import Go from "./go.js";
import {Copy} from "../Util.js";

export function GoCopy(gogogo){
    const new_go = new Go(JSON.parse(JSON.stringify(gogogo.board)), gogogo.turn_cnt)
    new_go.play_histroy = Copy(gogogo.play_histroy)
    new_go.passed = gogogo.passed
    new_go.end = gogogo.end
    return new_go
}

export function NodeCopy(nonono) {
    return new Node(nonono.data, nonono.id, nonono.children_id.slice(), nonono.parent_id);
}

export function TreeCopy(tree) {
    let arr = []
    for (let i = 0; i < tree.nodes.length; i++) {
        arr.push(NodeCopy(tree.nodes[i]));
    }
    let new_tree = new Tree(arr[0]);
    new_tree.nodes = arr.slice();
    return new_tree;
}

export class GameMove {
    constructor(player, position) {
        this.player = player;
        this.position = position;
    }

    copy() {
        return new GameMove(this.player, this.position);
    }
}

export class GameNodeGo {
    constructor(move, go) {
        this.go = go;
        this.move = move
        this.value = 0;
        this.simulations = 0;
    }

    copy() {
        const new_game_node = new GameNodeGo(this.move === null ? null : this.move.copy(), this.go == null ? null : this.go);
        new_game_node.value = this.value;
        new_game_node.simulations = this.simulations;
        return new_game_node;
    }
}