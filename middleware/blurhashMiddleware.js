const fs = require('fs');
const { encode } = require('blurhash');

const encodeBlurhash = async (file, req, res, next)=>{
    const buffer = await fs.promises.readFile(file);
    const blur = encode(new Uint8ClampedArray(buffer), 32, 32);
    req.blurhash = blur;
    res.json({blurhash : blur});
    next();
}

module.exports = encodeBlurhash;