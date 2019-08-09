import _ from 'lodash';

export default class MOL2Stream {
  constructor(data) {
    this._strings = data.split(/\r?\n|\r/);
    this._currentStart = 0;
    this._currentStringIndx = 0;
  }

  getNextString() {
    return this._strings[++this._currentStringIndx];
  }

  getCurrentString() {
    return this._strings[this._currentStringIndx];
  }

  getStringFromStart(numb) {
    this._currentStringIndx = this._currentStart + numb;
    return this._strings[this._currentStart + numb];
  }

  getHeaderString(header) {
    let curStr = this.getCurrentString();
    while (!_.isUndefined(curStr)) {
      if (curStr.match(`@<TRIPOS>${header}`)) {
        break;
      }
      curStr = this.getNextString();
    }
    return this._strings[this._currentStringIndx];
  }
}
