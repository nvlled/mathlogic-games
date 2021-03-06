let Util = require("src/client/algebra/Util");
let AniSprite = require("src/client/algebra/AniSprite");
let TextureSet = require("src/client/algebra/TextureSet");
let dir = "static/images/rpgchars";
let names = [
	"healer_f",
	"healer_m",
	"mage_f",
	"mage_m",
	"ninja_f",
	"ninja_m",
	"ranger_f",
	"ranger_m",
	"townfolk1_f",
	"townfolk1_m",
	"warrior_f",
	"warrior_m",
];

let M = {
    create({
    }={}) {
        return {
            textureSets: [],
        }
    },

    loadTextures(self, loader) {
        names.forEach(name => loader.add(name, dir+"/"+name+".png"));
    },

    getConstructors(self, resources) {
        let n = 12;
        let {tileHeight, tileWidth} = self;
        let ctors = [];
        names.forEach(name => {
            if (!self.textureSets[name]) {
                let image = resources[name].texture;
                self.textureSets[name] = 
                    TextureSet.new({image, cols: 3, rows: 4});
            }
            let textureSet = self.textureSets[name];
            ctors.push(args => {
                let sprite = AniSprite.new(Object.assign({
                    textureSet: textureSet,
                    states: {
                        idle: [7],
                        left: [9,10,11],
                        down: [6,7,8],
                        right: [3,4,5],
                        up: [0,1,2],
                    },
                    animationSpeed: 0.05
                }, args));
                return sprite;
            });
        });
        return ctors;
    },
}

M.new = Util.constructor(M);
module.exports = M;


