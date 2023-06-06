const sokoban_representation = (s) => {

    s.onFinished = null

    s.setup = () => {
        s.canvas_id = s._userNode.id
        let size = Math.max(s._userNode.offsetWidth, s._userNode.offsetHeight)
        s.canvas = s.createCanvas(size, size)
        s.board = null
        if(s.onFinished!==null){
            s.onFinished()
        }
    }

    s.draw = () => {
        s.background(255)
        if (s.board === null) return
        s.drawBoard()
    }

    s.drawBoard = () => {
        let textSize = 25 / 200 * s.width
        let tileSize = s.width / s.board.length
        for (let i = 0; i < s.board.length; i++) {
            for (let j = 0; j < s.board.length; j++) {
                let tile = s.board[i][j]
                // s.fill(tile / 5 * 255)
                if (tile === 5) {
                    s.fill(0)
                    s.rect(j * tileSize, i * tileSize, tileSize, tileSize)
                    s.fill(255)
                    s.textSize(textSize)
                    s.textAlign(s.CENTER, s.CENTER)
                    s.text(tile, j * tileSize + tileSize / 2, i * tileSize + tileSize / 2 + 3)
                } else {

                    if(s){
                        s.fill(255)
                        // s.noStroke()
                        s.rect(j * tileSize, i * tileSize, tileSize, tileSize)
                        // s.fill(255 - tile/ 5 * 255)
                        s.fill(0)
                        s.textSize(textSize)
                        s.textAlign(s.CENTER, s.CENTER)
                        s.text(tile, j * tileSize + tileSize / 2, i * tileSize + tileSize / 2 + 3)
                        // s.text(tile, j * tileSize , i* tileSize )
                    }

                }


            }
        }
    }

}