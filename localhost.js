// BP
// webAppPlatform = 'android'
// BP Math.abs(t) > Math.abs(n) 
// move
// window.moveBoard = (direction) => r(Ri(direction)); false
// BP clear



/*
let script = document.createElement('script')
script.src = 'http://0.0.0.0:8000/localhost.js'
script.onload = console.log(src)
document.body.append(script)
*/
// window.stopBot = true

(function () {
    function getGrid() {
        const emptyCells = Array.from(document.querySelector('#board > div.tw-absolute.tw-z-0').children).map((cell => ({ x: cell.style.left, y: cell.style.top })))
        const grid = Array(16).fill(0)
        
        Array.from(document.querySelector('#board > div.tw-absolute.tw-z-10').children).forEach(cell => {
            // console.log('cell:', cell)
            const attrs = cell.attributeStyleMap.get('transform')
            // console.log('attrs:', attrs)
            const translation = Array.from(attrs.values()).find(attr => attr instanceof CSSTranslate)

            const x = '' + translation.x.value + translation.x.unit
            const y = '' + translation.y.value + translation.y.unit
            // console.log('x,y:', x, y)
            const cellIndex = emptyCells.findIndex((emptyCell) => {
                if (emptyCell.x === x && emptyCell.y === y) {
                    return true
                }
            })
            // console.log('cellIndex:', cellIndex)
            grid[cellIndex] = Number(cell.innerText)
        })
        return grid
    }

    function restartGame() {
        Array.from(document.querySelectorAll('p')).find((node) => node.innerText === 'Game over').click()
    }

    function offlineButton() {
        const btn = Array.from(document.querySelectorAll('p')).find((node) => node.innerText === 'Try again, bro')
        if (btn && window.getComputedStyle(btn)['pointerEvents'] !== 'none') {
            return btn
        }
        return null
    }

    function makeMove(direction) {
        let dx = 0
        let dy = 0
        if (direction === 'u') { dy = -50 }
        if (direction === 'd') { dy = 50 }
        if (direction === 'r') { dx = 50 }
        if (direction === 'l') { dx = -50 }
        window.tStart({ touches:[{ clientX: 100, clientY: 400 }], preventDefault: ()=>{} })
        window.tEnd({ changedTouches:[{ clientX: 100+dx, clientY: 400+dy }], preventDefault: ()=>{} })
      }

    function nextMove() {

        if (offlineButton()) {
            console.log('Offline, retry...')
            offlineButton().click()
            return new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 5000))
        }

        var grid = getGrid();

        const codedBoard = grid.map((v) => {
            if (v === 0) return 0
            return Math.round(Math.log2(v)).toString(36)
        }).join('')
        // console.log('codedBoard:', codedBoard)
        return fetch('http://localhost:8080/move?board=' + codedBoard)
            .then(res => res.text())
            .then((move) => {
                if (!['u', 'd', 'r', 'l'].includes(move)) {
                    setTimeout(restartGame, 5000)
                    throw new Error('no move left')
                }
                makeMove(move)
            })
    }

    let randomFactor = 500
    setInterval(() => {
        randomFactor = 250 + Math.random() * 500
    }, 35000)

    function repeat() {
        if (window.botStopped) {
            console.log('stopped', new Date())
            return
        }
        nextMove().then(() => setTimeout(repeat, 500 + Math.random() * randomFactor))
    }

    window.stopBot = () => {
        window.botStopped = true
    }

    window.startBot = () => {
        console.log('started', new Date())
        window.botStopped = false
        repeat()
    }

    window.startBot()

})()
