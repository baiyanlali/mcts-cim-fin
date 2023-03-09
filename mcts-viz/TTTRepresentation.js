

const ttt_representation = (s)=>{
    s.setup = () => {
        s.canvas_id = s._userNode.id
        let size = Math.max(s._userNode.offsetWidth, s._userNode.offsetHeight)
        s.canvas = s.createCanvas(size, size)
        s.board = null
    }

    s.draw = () =>{
        s.background(255)
        if(s.board===null) return
        s.drawBoard()
    }

    s.drawBoard=()=>{
        let textSize = 25 / 200 * s.width

        let tileSize = s.width/Math.sqrt(s.board.length)

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let tile = s.board[i * 3 + j];
                switch (tile) {
                    case "h":
                        s.fill("#00cec9")
                        break
                    case "m":
                        s.fill("#fab1a0")
                        break
                    default:
                        s.fill("#dfe6e9")
                        break
                }
                s.noStroke()
                // console.log([j, i])
                s.rect(j * tileSize, i * tileSize, tileSize, tileSize)

                s.textSize(textSize)
                s.fill(0)
                s.textAlign(s.CENTER, s.CENTER)
                s.text(tile, j * tileSize + tileSize/2, i* tileSize + tileSize/2)
            }
        }

    }

}