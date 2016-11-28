class Progress {
  constructor (task, total = 100) {
    this._completeChar = '='
    this._endChar = ']'
    this._incompleteChar = ' '
    this._startChar = '['
    this._task = task
    this._total = total
  }

  render (curr, total) {
    if (total) {
      this._total = total
    }

    let i
    let complete = ''
    let remaining = ''

    for (i = 0; i < curr; i++) {
      complete += this._completeChar
    }

    for (i = 0; i < this._total - curr; i++) {
      remaining += this._incompleteChar
    }

    let msg = `
      ${this._task}: ${this._startChar}${complete}${remaining}${this._endChar}\n
    `

    console.log(msg)
  }
}

export default Progress
