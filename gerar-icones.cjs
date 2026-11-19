const fs = require("fs");
const zlib = require("zlib");

function crc32(buf){
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++){
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(tipo, dados){
  const len = Buffer.alloc(4); len.writeUInt32BE(dados.length);
  const t = Buffer.from(tipo, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dados])));
  return Buffer.concat([len, t, dados, crc]);
}
function png(tam){
  const W = tam, H = tam, SS = 3; // supersampling
  const px = Buffer.alloc(W*H*4);
  const cor = (x, y) => {
    const u = x / W, v = y / H;
    // fundo: gradiente vinho
    let r = 0x1a + 0x40 * (1 - v), g = 0x05 + 0x10 * (1 - v), b = 0x10 + 0x24 * (1 - v);
    let a = 255;
    // coração rosa com glow
    let dentro = 0, glow = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++){
      const px2 = u + (sx + .5) / SS / W, py2 = v + (sy + .5) / SS / H;
      // coordenadas centradas, y para cima
      const X = (px2 - .5) * 2.9, Y = -(py2 - .52) * 2.9;
      const eq = Math.pow(X*X + Y*Y - 1, 3) - X*X*Math.pow(Y,3);
      if (eq <= 0) dentro++;
      else if (eq < 0.35) glow++;
    }
    const n = SS*SS;
    if (dentro){
      const t = Math.min(1, dentro / n);
      const top = 1 - v;
      const cr = 255, cg = Math.round(0x4d + 0x50 * top), cb = Math.round(0x80 + 0x40 * top);
      r = r * (1 - t) + cr * t; g = g * (1 - t) + cg * t; b = b * (1 - t) + cb * t;
    } else if (glow){
      const t = Math.min(.55, glow / n * .5);
      r = r * (1 - t) + 255 * t; g = g * (1 - t) + 90 * t; b = b * (1 - t) + 130 * t;
    }
    return [Math.round(r), Math.round(g), Math.round(b), a];
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const [r, g, b, a] = cor(x, y);
    const i = (y*W + x)*4;
    px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = a;
  }
  // filtro 0 por linha
  const linhas = Buffer.alloc((W*4 + 1) * H);
  for (let y = 0; y < H; y++){
    linhas[y*(W*4+1)] = 0;
    px.copy(linhas, y*(W*4+1) + 1, y*W*4, (y+1)*W*4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(linhas, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
for (const t of [192, 512]){
  fs.writeFileSync(`icone-${t}.png`, png(t));
  console.log("icone-" + t + ".png");
}
fs.copyFileSync("icone-192.png", "apple-touch-icon.png");
console.log("apple-touch-icon.png");
