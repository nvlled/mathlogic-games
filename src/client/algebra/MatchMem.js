
let Waypoint = require("src/client/algebra/Waypoint");
let Util = require("src/client/algebra/Util");
let Vec = require("src/client/algebra/Vec");
let Grid = require("src/client/algebra/Grid");
let Block = require("src/client/algebra/Block");
let Keyboard = require("src/client/algebra/Keyboard");
let PIXI = require("src/client/pixi");

let M = {
    create({
        algebra,
        rows=4,
        cols=4,
        tileSize,
        tileSpace,
        tileMap,
        x, y,
        speed=900,
        stretch=.8,
        interactive,

        onGameOver=()=>{},
    } = {}) {
        let grid = Grid.new({
            x, y, rows, cols, tileSize, tileSpace, tileMap,
            speed, stretch, interactive,
        });
        grid.setInteractive();
        
        let self = {
            grid,
            algebra,
            keys: {
                left: Keyboard(37),
                up: Keyboard(38),
                right: Keyboard(39),
                down: Keyboard(40),
            },
            ticker: new PIXI.ticker.Ticker(),
            actions: [],
            initialized: false,
            releasing: false,
            running: false,
            timerId: null,
            lastDir: {x: 0, y: 0},
            actions: Actions.new({throttle: 350}),
        };

        return self;
    },

    init(self) {
        self.grid.onTileClick = ({x, y}) => {
            let prevSprite = self.grid.spriteAt({x, y});
            let alg = self.algebra;
            let elem = null;
            if (prevSprite) {
                prevSprite.destroy();
                self.grid.removeSprite({x, y});
                let elem = alg.getElem(prevSprite);
                elem = Util.nextItem(alg.getElems(), elem);

                if (elem) {
                    let sprite = self.algebra.createSprite(elem);
                    self.grid.setSprite({sprite, x, y});
                    M.checkTiles(self, {x, y});
                }
            } else {
                let sprite = self.algebra.createSprite(alg.getElems()[0]);
                self.grid.setSprite({sprite, x, y});
                M.checkTiles(self, {x, y});
            }

        }

        //self.grid.hightlightTiles([
        //        {x: 0, y:0},
        //        {x: 1, y:0},
        //        {x: 0, y:1},
        //], 0xff0000);
        //self.grid.hightlightRange({x: 0, y: 2}, {x: 3, y: 2});
    },

    // TODO:
    checkTiles(self, pos) {
        let {grid} = self;
        let sprite = self.grid.spriteAt(pos); 
        if (!sprite)
            return;
        let row = grid.getRow(pos.y, false);
        let col = grid.getColumn(pos.x, false);

        grid.clearHighlights(row);
        grid.clearHighlights(col);

        let alg = self.algebra;
        let elem = alg.getElem(sprite);
        row = row.filter(pos_ => {
            let sprite_ = grid.spriteAt(pos_);
            //return elem == alg.getElem(sprite_) && sprite != sprite_;
            return elem == alg.getElem(sprite_);

        });
        col = col.filter(pos_ => {
            let sprite_ = grid.spriteAt(pos_);
            return elem == alg.getElem(sprite_);

        });
        console.log(elem, row);
        if (row.length > 1)
            self.grid.hightlightTiles(row, 0xff0000); 
        if (col.length > 1)
            self.grid.hightlightTiles(col, 0xff0000); 
    },

    newGame(self) {
        self.grid.clearSprites();
        M.start(self);
    },

    start(self) {
        M.init(self);
        //M.listenKeys(self);
        //self.actions.start();
        //self.randomize(5);
    },

    stop(self) {
        M.unlistenKeys(self);
        self.actions.stop();
    },

    moveUp(self) {
        self.lastDir = {x: 0, y: -1};
        return self.actions.add(_=> self.grid.dropVertical({dir: -1}));
    },

    moveLeft(self) {
        self.lastDir = {x: -1, y: 0};
        return self.actions.add(_=> self.grid.dropHorizontal({dir: -1}));
    },

    moveRight(self) {
        self.lastDir = {x:  1, y: 0};
        return self.actions.add(_=> self.grid.dropHorizontal({dir: 1}));
    },

    moveDown(self) {
        self.lastDir = {x: 0, y:  1};
        return self.actions.add(_=> self.grid.dropVertical({dir: 1}));
    },

    randomize(self, count=2) {
        let {algebra, grid} = self;
        let filled = {};
        let retries = 128;
        let n;
        for (n = 0; n < count; n++) {
            let elem = algebra.randomElement();
            let sprite = algebra.createSprite(elem);
            let [_, i] = Util.randomSelect(grid.tiles, filled, false);
            if (i == null)
                return false;

            filled[i] = true;
            filled[elem] = true;
            let {x, y} = grid.toXY(i);
            if (self.grid.hasSprite({x, y})) {
                n--;
                retries--;
                if (retries <= 0)
                    break;
            } else {
                grid.setSprite({x, y, sprite});
            }
        }
        return n == count;
    },

    combineElements(self) {
    },

    listenKeys(self) {
        for (let key of Object.values(self.keys)) {
            key.listen();
        }
    },
    unlistenKeys(self) {
        for (let key of self.keys) {
            key.unlisten();
        }
    },

}
M.new = Util.constructor(M);
module.exports = M;
