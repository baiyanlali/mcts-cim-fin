
export const ActionColor = {
    Selection: "#B41E1E",
    selection: "#B41E1E",
    PSelection: "#df745a",
    pselection: "#df745a",
    BackPropagation: "#1E1EB4",
    backPropagation: "#1E1EB4",
    backpropagation:"#1E1EB4",
    Expansion: "#1EB41E",
    expansion: "#1EB41E",
    Simulation: "#1EB4B4",
    simulation: "#1EB4B4",
    White: "#FFFFFF"
  }

export const vis = (s) => {
  s.show_simple = true;
  s.info_duration = 30;
  let tree = null;
  let initial_board = null;

  let zoom = 1.00;
  let zMin = 0.05;
  let zMax = 9.00;
  let sensitivity = 0.001;
  let offset = {x: 20, y: 20, zoom: 1.00};
  let dragging = false;
  let lastMouse = {"x": 0, "y": 0};
  let hovered_node_id = -1;
  let hovered_node = null;
  let hovered_node_pos = {x: 0, y: 0};

  let node_distance = {x: 0.5, y: 0.75};

  let node_size = {x: 50, y: 55};

  const show_txt = node_size.x * 1.8

  s.preload = ()=>{
    s.circleImg = s.loadImage("image/tic-tac-toe/circle1.png")
    s.crossImg = s.loadImage("image/tic-tac-toe/cross1.png")
  }

  s.windowResized = ()=>{
    let height =s.canvas_div.clientHeight
    let width = s.canvas_div.clientWidth
    s.resizeCanvas(width, height - 20)
  }

  s.setup = () => {
    s.textFont("Courier");

    s.canvas_div = s._userNode

    let height =s.canvas_div.clientHeight
    let width = s.canvas_div.clientWidth

    s.createCanvas(width, height - 20)

    s.info_position = {y: 0}
    s.tween = null

    s.checkBox = s.createCheckbox('Show Detail', true)

    s.last_info = {}

    s.frameRate(60)
  };

  s.draw = () => {
    TWEEN.update();

    s.show_simple = !s.checkBox.checked()

    s.handleHover();

    s.background(255);
    s.push();

    s.translate(offset.x, offset.y);
    s.scale(offset.zoom);

    if (s.tree) {
      s.postorder_draw_tree(s.tree.getRoot(), s.initial_board);
    }

    s.pop();

    s.updateNodeInfo()
  };

  s.info_position = {y: 0}

  s.updateNodeInfo = () =>{
    s.push()
    const textSize = 35

    // console.log("info y: ", s.info_position.y)
    s.translate(0 ,s.info_position.y)
    s.textSize(textSize)
    s.fill(0)

    if(hovered_node_id !== -1){
      if(s.tween===null){
        s.tween = new TWEEN.Tween(s.info_position).to({y: 0}, s.info_duration).easing(TWEEN.Easing.Quadratic.In)
        s.tween.start()
        s.tween.onComplete(()=>{
          s.tween = null
        })
      }

      if(hovered_node.vis_txt === undefined){
        s.pop()
        return
      }
      s.fill("#636e72")

      s.rect(0,0,7 * textSize, 3 * textSize, 5)

      s.fill("#dfe6e9")
      if(hovered_node.isRoot()){
        let visits = hovered_node.vis_txt

        s.last_info = {
          vis: visits,
        }

        s.textAlign(s.LEFT, s.TOP)
        s.text(" vis:", 0, textSize);
        s.textAlign(s.RIGHT, s.TOP);
        s.text(visits + " ", 7 * textSize, textSize);
      }else{
        let uct = hovered_node.uct_txt
        let value = hovered_node.val_txt
        let visits = hovered_node.vis_txt

        s.last_info = {
          val: value,
          vis: visits,
          uct: uct
        }

        if (isNaN(uct)) {
          uct = "--";
        }
        s.textAlign(s.LEFT, s.TOP);
        s.text(" val:", 0, 0);
        s.text(" vis:", 0, textSize);
        s.text(" uct:", 0, textSize*2);
        s.textAlign(s.RIGHT, s.TOP);
        s.text(value + " ", 7 * textSize, 0);
        s.text(visits + " ", 7 * textSize, textSize);
        s.text(uct + " ", 7 * textSize, textSize*2);
      }

    }
    else{
      if(s.tween===null){
        s.tween = new TWEEN.Tween(s.info_position).to({y: -textSize*3 - 5}, s.info_duration).easing(TWEEN.Easing.Quadratic.Out)
        s.tween.start()
        s.tween.onComplete(()=>{
          s.tween = null
        })
      }

      if(hovered_node == null || s.last_info === null){
        s.pop()
        return
      }

      s.fill("#636e72")

      s.rect(0,0,7 * textSize, 3 * textSize, 5)

      s.fill("#dfe6e9")
      if(hovered_node.isRoot()){
        let visits = s.last_info.vis
        s.textAlign(s.LEFT, s.TOP)
        s.text(" vis:", 0, textSize);
        s.textAlign(s.RIGHT, s.TOP);
        s.text(visits + " ", 7 * textSize, textSize);
      }else{
        let uct = s.last_info.uct
        let value = s.last_info.val
        let visits = s.last_info.vis
        if (isNaN(uct)) {
          uct = "--";
        }
        s.textAlign(s.LEFT, s.TOP);
        s.text(" val:", 0, 0);
        s.text(" vis:", 0, textSize);
        s.text(" uct:", 0, textSize*2);
        s.textAlign(s.RIGHT, s.TOP);
        s.text(value + " ", 7 * textSize, 0);
        s.text(visits + " ", 7 * textSize, textSize);
        s.text(uct + " ", 7 * textSize, textSize*2);
      }
    }


    s.pop()
  }

  s.updateTree = (tree) => {
    s.tree = tree;
  }

  s.postorder_draw_tree = (node, model) => {
    //TODO: 解决展开缩减节点后视角跳动的问题
  	let children = s.tree.getChildren(node);
    if (!node.data.collapsed) {
    	for (let i = 0; i < children.length; i++) {
    		let child = children[i];

    		let child_model = model.copy();
    		child_model.makeMove(child.data.move);

    		s.postorder_draw_tree(child, child_model);
    	}
    }

  	s.push();
    if(!s.show_simple)
  	  s.translate(node.data.final_x * (1 + 1.8 + node_distance.x) * node_size.x,
  		          node.data.y       * (1 + node_distance.y) * node_size.y);
    else
      s.translate(node.data.final_x * (1 + node_distance.x) * node_size.x,
  		          node.data.y       * (1 + node_distance.y) * node_size.y);
    s.toggleNodeColors(node);

  	//draw node content
  	s.drawNode(model, node.data.value, node.data.simulations, node);

    // s.toggleNodeColors(node);



    if (node.data.should_show_collapse_btn) {
      if(!s.show_simple){
        s.fill(0);
        s.circle(node_size.x + 10, node_size.y, node_size.x / 4);
        s.fill(255);
        s.textAlign(s.CENTER, s.CENTER);
        s.strokeWeight(0);
        s.text(node.data.collapsed ? "+" : "-", node_size.x + 10, node_size.y + 1);
      }else{
        s.fill(0);
        s.circle(node_size.x / 2, node_size.y, node_size.x / 4);
        s.fill(255);
        s.textAlign(s.CENTER, s.CENTER);
        s.strokeWeight(0);
        s.text(node.data.collapsed ? "+" : "-", node_size.x / 2, node_size.y + 1);
      }

    }

  	s.pop();

    s.toggleActionColors(null);
  	//drawing edges
    if (children.length > 0 && !node.data.collapsed) {
      s.noFill()
      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        if(child.data.simulated_board){
          s.drawingContext.setLineDash([5,5])
        }
        if(!s.show_simple){
            s.bezier(
            (node.data.final_x * (1 + 1.8 +node_distance.x) + 1) * node_size.x + 10,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_size.x / 8,
            (node.data.final_x * (1 + 1.8 +node_distance.x) + 1) * node_size.x + 10,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y/2 * node_size.y + node_size.x * 2 / 8,
            (child.data.final_x * (1+1.8 + node_distance.x) + 1) * node_size.x + 10,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y * node_size.y - node_distance.y/2 * node_size.y,
            (child.data.final_x * (1+1.8 + node_distance.x) + 1) * node_size.x + 10,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y * node_size.y,
        )
        }else{
          s.bezier(
            (node.data.final_x * (1+node_distance.x) + 0.5) * node_size.x,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_size.x / 8,
            (node.data.final_x * (1+node_distance.x) + 0.5) * node_size.x,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y/2 * node_size.y + node_size.x * 2 / 8,
            (child.data.final_x * (1 + node_distance.x) + 1/2) * node_size.x ,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y * node_size.y - node_distance.y/2 * node_size.y,
            (child.data.final_x * (1 + node_distance.x) + 1/2) * node_size.x,
            (node.data.y) * (1 + node_distance.y) * node_size.y + node_size.y + node_distance.y * node_size.y,
        )
        }


        s.drawingContext.setLineDash([])
      }
    }

  }

  s.drawGame = (board) =>{
    let tile_size = node_size.x / 3
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        let tile = board.grid[i * 3 + j];
        let draw_tile = null

        if (tile === "h") {
            // s.fill(100, 100, 240);
          s.fill("#00cec9")
          draw_tile = s.crossImg

        } else if (tile === "m") {
          s.fill("#fab1a0")
          draw_tile = s.circleImg
            // s.fill(240, 100, 100);
        } else {
            // s.fill(220, 220, 220);
          s.fill("#dfe6e9");
        }

        // s.strokeWeight(0);
        s.rect(j * tile_size, i* tile_size, tile_size, tile_size, 5);

        if(draw_tile!==null){
          s.image(draw_tile, j * tile_size, i *  tile_size, tile_size, tile_size)
        }

        s.fill(0);
        // s.textAlign(s.CENTER, s.CENTER);
      }
    }
  }


  s.drawNode = (board, value, visits, node) => {
    if (node.data.simulated_board) {
      board = node.data.simulated_board;
    }

    let tile_size = node_size.x / 3;


    if (node.id == hovered_node_id) {
      s.fill(200);
    } else {
      s.fill(255)
    }

    if (node.data.best_move) {
      s.strokeWeight(2);
      s.stroke(255, 0, 0);
    }

    if(s.show_simple){
      s.rect(0, 0, node_size.x, node_size.y, 5);
    }else{
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


      if (!node.isRoot()) {
        let uct = UCB1(node, s.tree.getParent(node)).toFixed(2);
        if (isNaN(uct)) {
          uct = "--";
        }


        if (node === hovered_node) {
          node.uct_txt = uct
          node.vis_txt = visits
          node.val_txt = value
        }

        if(!s.show_simple) {

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
        if (node === hovered_node) {
          node.vis_txt = visits
          node.val_txt = value
        }
        if(!s.show_simple) {

          s.textAlign(s.LEFT, s.TOP);
          // s.text(" val: ", 0, 0);
          s.text(" vis: ", 0, (node_size.y) / 4);
          s.textAlign(s.RIGHT, s.TOP);
          // s.text("  "+value + " ", 30 + node_size.x, 0);
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
      s.text(winner_icon === "v" ? "DRAW" : ("WINNER: " + winner_icon), 0, node_size.y * 1.25);
    }
  }

  s.toggleNodeColors = (node) => {
    let action_kind = "";


    if (node.data.selected) {
      action_kind = "selection";
    } else if (node.data.backpropagated) {
      action_kind = "backpropagation";
    } else if (node.data.expanded) {
      action_kind = "expansion";
    } else if (node.data.simulated) {
      action_kind = "simulation";
    } else{
      let children = s.tree.getChildren(node)

      for (let child of children) {
        if(child.data.expanded){
          action_kind = "pselection";
        }
      }

    }
    s.toggleActionColors(action_kind)
    // s.focusNode(node)
  }



  s.toggleActionColors = (action_kind) => {
    switch (action_kind) {
      case "selection":
        s.strokeWeight(1);
        s.stroke("#B41E1E");
        s.fill("#B41E1E");
        break;
      case "pselection": // parent selection
        s.strokeWeight(1);
        s.stroke("#df745a");
        s.fill("#df745a");
        break;
      case "backpropagation":
        s.strokeWeight(1);
        s.stroke("#1E1EB4");
        s.fill("#1E1EB4");
        break;
      case "expansion":
        s.strokeWeight(1);
        s.stroke("#1EB41E");
        s.fill("#1EB41E");
        break;
      case "simulation":
        s.strokeWeight(1);
        s.stroke("#1EB4B4");
        s.fill("#1EB4B4");
        break;
      default:
        s.fill(0);
        s.stroke(0);
        break;
    } 
  }

  s.focusNode = (node, onMouse = false) => {
    let centered = {
      x: onMouse ? (s.mouseX - hovered_node_pos.x) : (s.width  / 2),
      y: onMouse ? (s.mouseY - hovered_node_pos.y) : (s.height / 2),
    };

    let target_offset = {
      x: 0,
      y: - node.data.y * (1 + node_distance.y) * node_size.y + s.height / 4,
      zoom: 1
    }

    if(!s.show_simple){
      target_offset.x = - node.data.final_x * (1 + 1.8 + node_distance.x) * node_size.x + s.width  / 2
    }else{
      target_offset.x = - node.data.final_x * (1 + node_distance.x) * node_size.x + s.width  / 2
    }

    // target_offset.x = offset.x


    if(s.focusTween === undefined ){
      s.focusTween = null
      offset = target_offset
    }
    else if(s.focusTween === null){
        // console.log("start",offset)
        s.focusTween = new TWEEN.Tween(offset)
          .to(target_offset, 50)
          .easing(TWEEN.Easing.Linear.None)
        s.focusTween.start()
        s.focusTween.onComplete(
          ()=>{
            s.focusTween = null
          })
        // s.focusTween.onUpdate((obj)=>{console.log(obj)})
    }



  }

  s.setInteractive = (interactive)=>{
    s.interactive = interactive
  }

  s.mousePressed = () => {

    if (!(s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height && s.tree)) return;
    dragging = true;
    lastMouse.x = s.mouseX;
    lastMouse.y = s.mouseY;

    if (hovered_node_id != -1) {
      let pressed_node = s.tree.get(hovered_node_id);
      s.interactive.toggleCollapse(pressed_node);
    }
  }

  s.mouseDragged = () => {
    if (dragging) {
      offset.x += (s.mouseX - lastMouse.x);
      offset.y += (s.mouseY - lastMouse.y);
      lastMouse.x = s.mouseX;
      lastMouse.y = s.mouseY;
    }
  }

  s.mouseReleased = () => {
    dragging = false;
  }

  s.mouseWheel = (event) => {
    //鼠标放在树上面的时候占据鼠标滚轮，否则松开鼠标滚轮
    if (s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height && s.tree) {
      offset.zoom += sensitivity * -event.delta;
      offset.zoom = s.constrain(offset.zoom, zMin, zMax);
      return false;
    }else return true;
  }

  s.handleHover = () => {
    if (s.mouseX > 0 && s.mouseY > 0 && s.mouseX < s.width && s.mouseY < s.height && s.tree) {
      for (let i = 0; i < s.tree.nodes.length; i++) {
        let node = s.tree.nodes[i];
        let bounds = {};
        if(!s.show_simple)
        bounds = {
          x_min:  (node.data.final_x * (1 + 1.8 + node_distance.x) * node_size.x) * offset.zoom + offset.x,
          y_min:  (node.data.y       * (1 + node_distance.y) * node_size.y) * offset.zoom + offset.y,
          width:  node_size.x * 2.8 * offset.zoom,
          height: node_size.y * offset.zoom
        };
        else
        bounds = {
          x_min:  (node.data.final_x * (1 + node_distance.x) * node_size.x) * offset.zoom + offset.x,
          y_min:  (node.data.y       * (1 + node_distance.y) * node_size.y) * offset.zoom + offset.y,
          width:  node_size.x * offset.zoom,
          height: node_size.y * offset.zoom
        };

        if (s.mouseX > bounds.x_min && s.mouseY > bounds.y_min 
          && s.mouseX < (bounds.x_min + bounds.width) 
          && s.mouseY < (bounds.y_min + bounds.height)) {
          hovered_node_id = node.id;
          hovered_node = node;
          hovered_node_pos = {
            x: s.mouseX - bounds.x_min,
            y: s.mouseY - bounds.y_min};
          return;
        }
      }
    }

    hovered_node_id = -1;
    hovered_node_pos = {x: 0, y: 0};
  }
};

