

class expansion_interactive extends TTTInteractive{

    constructor(tree_vis_p5, id, my_p5) {
        super(tree_vis_p5, id, my_p5);
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
}