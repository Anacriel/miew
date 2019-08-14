import _ from 'lodash';

export default class MOL2Stream {
  constructor(data) {
    this._strings = data.split(/\r?\n|\r/);
    this._currentStart = 0;
    this._currentStringIndx = 0;
  }

  /**
   * Sets the starting position taking into account possible
   * beyond the boundary position
   * @param {number} start - The start position
   */
  setStart(start) {
    if (start >= this._strings.length) {
      this._currentStart = this._strings.length - 1;
      this._currentStringIndx = this._strings.length - 1;
    } else {
      this._currentStart = start;
      this._currentStringIndx = start;
    }
  }

  /**
   * Returns the next string from the stream
   *
   * @return {string} The next string
   */
  getNextString() {
    return this._strings[++this._currentStringIndx];
  }

  /**
   * Returns the current string from the stream
   *
   * @return {string} The current string
   */
  getCurrentString() {
    return this._strings[this._currentStringIndx];
  }

  /**
   * Returns the numb-th string from the start
   *
   * @param {number} numb - The bias
   * @return {string} The numb-th string if it is not beyond the boundary,
   * otherwise it returns the start string
   */
  getStringFromStart(numb) {
    const numbStr = this._strings[this._currentStringIndx + numb];
    if (_.isUndefined(numbStr)) {
      this._currentStringIndx = this._currentStart;
      return this._strings[this._currentStringIndx];
    }
    this._currentStringIndx = this._currentStart + numb;
    return this._strings[this._currentStringIndx];
  }

  /**
   * Returns the numb-th string from the start
   *
   * @param {string} header - The header to count from
   * @param {number} numb - The bias
   * @return {string} The numb-th string if it is not beyond the boundary and
   * the header was found,
   * otherwise it returns the start string
   */
  getStringFromHeader(header, numb) {
    const headerStr = this.getHeaderString(header);
    const numbStr = this._strings[this._currentStringIndx + numb];
    if (headerStr.match(`@<TRIPOS>${header}`) && !_.isUndefined(numbStr)) {
      this._currentStringIndx += numb;
    }
    return this._strings[this._currentStringIndx];
  }

  /**
   * Returns the header string
   *
   * @param {string} header - The header to look for
   * @return {string} The header string if it was found,
   * otherwise it returns the start string
   */
  getHeaderString(header) {
    this.getStringFromStart(0);
    let curStr = this.getCurrentString();
    while (!_.isUndefined(curStr)) {
      if (curStr.match(`@<TRIPOS>${header}`)) {
        return this._strings[this._currentStringIndx];
      }
      curStr = this.getNextString();
    }
    return this.getStringFromStart(0);
  }

  /**
   * Sets the next compound start and checks is there other
   * data on molecules to parse in the stream
   *
   * @return {boolean} Whether the data on other molecules is found or not
   */
  findNextCompoundStart() {
    let curStr = this.getCurrentString();
    while (!_.isUndefined(curStr) && curStr.trim() !== '@<TRIPOS>MOLECULE>') {
      curStr = this.getNextString();
    }
    this.setStart(++this._currentStringIndx);
    return this.probablyHaveDataToParse();
  }

  /**
   * Checks if there are any data to parse
   *
   * @return {boolean} Whether there are any strings in the stream  or not
   */
  probablyHaveDataToParse() {
    return this._currentStringIndx < this._strings.length - 2;
  }
}
