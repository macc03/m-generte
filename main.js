const fs = require('fs')
const path = require('path')

class ConversionUtil {
  constructor(fileName) {
    this.fileName = fileName
    data: null
    this.cLen = 0
    this.dLen = 0
    this.d_index = 0
    this.dataArray = []
    this.CDataPattern = /<td.*divc="(?<divc>.*?)".*v-text="(?<ctext>.*?)".*@blur="(?<blurFn>.*?)".*<\/td>/gm
    this.DDataPattern = /divd="(?<divd>.*?)".*[v\-text|v\-html]="(?<dtext>.*?)"(?<clickFn>.?).*@blur="(?<blurFn>.*?)".*<\/td>/gm
  }

  start() {
    fs.readFile(this.fileName.replace(/\\/g, '/'), 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      this.data = data
      this.generatorData(data)
    })
  }
  generatorData(data) {
    const lineData = data.split('\n')

    lineData.forEach(item => {
      let newLine = this.getData_c(item) || this.getData_d(item) || this.getJyp(item) || item
      this.dataArray.push(newLine)
    })
    this.writeData(this.dataArray)
  }

  getJyp(line) {
    let temp = line
    return line.includes('sgjl')
            ? temp = temp.replace('sgjl','jyp')
            : null
  }

  getData_c(line) {
    let temp = line
    let obj = this.CDataPattern.exec(temp)
    if (obj) {
      this.cLen++
      const remainder = this.cLen % 3
      let index = Math.floor(this.cLen / 3.1)
      let row_index;
      switch (remainder) {
        case 1:
          row_index = 0;
          break;
        case 2:
          row_index = 1
          break;
        case 0:
          row_index = 2
          break;
      }
      const { divc, ctext, blurFn } = obj.groups
      temp = temp.replace(divc, index).replace(ctext, `value.c[${index}][${row_index}]`).replace(blurFn, `YSblur($event, value, 'c', [${index}, ${row_index}])`)
      return temp
    }
    return null
  }

  getData_d(line) {
    let temp = line
    let obj = this.DDataPattern.exec(temp)
    if (obj) {
      const { divd, dtext, clickFn, blurFn } = obj.groups
      const divdLen = this.data.match(this.DDataPattern).length
      this.dLen++
      let [index60, index61] = [divdLen - 1, divdLen]

      switch (this.dLen) {
        case 1:
          temp = temp.replace(divd, '58').replace(dtext, `value.d[58]`).replace(clickFn, ` @click="YSclcik_divd($event, 58)" `).replace(blurFn, `YSblur($event, value, 'd', 58)`)
          break;
        case 2:
          temp = temp.replace(divd, '59').replace(dtext, `value.d[59]`).replace(clickFn, ` @click="YSclcik_divd($event, 59)" `).replace(blurFn, `YSblur($event, value, 'd', 59)`)
          break;
        case index60:
          temp = temp.replace(divd, '60').replace(dtext, `value.d[60]`).replace(clickFn, ` @click="YSclcik_divd($event, 60)" `).replace(blurFn, `YSblur($event, value, 'd', 60)`)
          break;
        case index61:
          temp = temp.replace(divd, '61').replace(dtext, `value.d[61]`).replace(clickFn, ` @click="YSclcik_divd($event, 61)" `).replace(blurFn, `YSblur($event, value, 'd', 61)`)
          break;
        default:
          temp = temp.replace(divd, `${this.d_index}`).replace(dtext, `value.d[${this.d_index}]`).replace(clickFn, ` @click="YSclcik_divd($event, ${this.d_index})" `).replace(blurFn, `YSblur($event, value, 'd', ${this.d_index})`)
          this.d_index++
      }

      return temp
    }
    return null
  }

  async writeData(data) {
    const content = data.join('\n')
    fs.writeFile(this.fileName.replace('.vue', '_g.vue'), content, err => {
      if (err) {
        console.error(err)
        return
      }
      console.log(this.fileName.replace('.vue', '_g.vue')+ '写入成功')
    })
  }
}


const createInstance = (fileName) => {
  return new ConversionUtil(fileName)
}

const getPath = arr => {
  return process.argv.slice(2).reduce((prev, curr) => {
    const [key, value] = [curr.split('=')[0], curr.split('=')[1]]
    prev[key] = value
    return prev
  }, {}).path
}

const folderPath = getPath() || __dirname

try {
  fs.readdirSync(folderPath).map(fileName => {
    if (fileName.endsWith('.vue')) {
      createInstance(folderPath + `\\${fileName}`).start()
    }
  })
} catch(e) {
  console.error(e)
}
