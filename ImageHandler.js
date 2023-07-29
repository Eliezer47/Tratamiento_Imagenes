class ImageHandler {
  /**
   * ImageHandler tiene 3 atributos internos.
   *
   * path: Path de la imagen cuyos pixeles se quieren leer.
   * pixels: Array de arrays (Matriz) que representa cada uno de los pixeles de la imagen. Inicialmente vacío.
   * shape: Array con las dimensiones de la imagen (ancho, alto, profundidad (0)). Inicialmente [0,0,0]
   * @param {*} path  Path de la imagen a leer.
   */

  constructor(path) {
    this.path = path;
    this.pixels = [];
    this.shape = [0, 0, 0];
    this._readImage();
  }

  /**
   * getPixels
   * @returns Array de pixeles de la imagen
   */
  getPixels() {
    return this.pixels;
  }

  /**
   * getShape
   * @returns Array de dimensiones de la imagen
   */
  getShape() {
    return this.shape;
  }

  /**
   * Dado un array de pixels, guarda dichos pixeles en la imagen gestionada por el handler.
   * @param {*} pixels - Array de pixeles a guardar en la imagen.
   * @param {*} path - Path de la imagen destino.
   * @param {*} width - Opcional: Ancho de la imagen. Si no se usa, se usara el ancho actual.
   * @param {*} height - Opcional: Altura de la imagen. Si no se usa, se usara la altura actual.
   *
   * Se recomienda hacer uso de las siguientes librerias:
   *  - fs
   *  - save-pixels
   *
   */
  savePixels(pixels, path, width = this.shape[0], height = this.shape[1]) {
    const fs = require("fs");
    let myFile = fs.createWriteStream(path);

    var savePixels = require("save-pixels");
    savePixels(this._rgbToNdArray(pixels, width, height), "jpg").pipe(myFile);
  }

  /**
   * _readImage
   * Lee la imagen gestionada por el handler.
   * Se encarga de dar valor al array de pixeles 'pixels' asociado a la imagen.
   * Se encarga de dar valor al array de dimensiones 'shape' asociado a la imagen.
   *
   * Se recomienda hacer uso de funciones auxiliares.
   * Se recomienda hacer uso de las siguientes librerias:
   *  - get-pixels
   *  - deasync
   *  - ndarray
   *
   */
  _readImage() {
    const getPixels = require("get-pixels");
    const deasync = require("deasync");

    function pixelGetter(src) {
      var ret = null;
      getPixels(src, function (err, result) {
        ret = { err: err, result: result };
      });

      while (ret == null) {
        deasync.runLoopOnce();
      }
      if (ret.err) {
        console.log("Bad image path");
        return;
      }
      return ret.result;
    }

    let result = pixelGetter(this.path);
    this.shape = result.shape;
    this.pixels = this._ndArrayToRGB(result);
  }
  _ndArrayToRGB(data) {
    let rgb = [];
    for (let i = 0; i < this.shape[0]; i++) {
      let line = [];
      for (let j = 0; j < this.shape[1]; j++) {
        let col = [data.get(i, j, 0), data.get(i, j, 1), data.get(i, j, 2)];
        line.push(col);
      }
      rgb.push(line);
    }

    return rgb;
  }

  _rgbToNdArray(rgb, width, height) {
    const ndarray = require("ndarray");
    let data = ndarray(new Float32Array(width * height * 4), [
      width,
      height,
      4,
    ]);

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        for (let k = 0; k < 3; k++) {
          data.set(i, j, k, rgb[i][j][k]);
        }
        data.set(i, j, 3, 255);
      }
    }
    return data;
  }
}

module.exports = ImageHandler;
