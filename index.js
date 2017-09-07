// chrome --remote-debugging-port=9222 --disable-gpu --headless --disable-extensions
const { Chromeless } = require('chromeless')
const cp = require('child_process')
const url = require('url');
const fs = require('fs')
const path = require('path')
const EXPORT_FOLDER = 'pdfs'
const EXPORT_URL = 'http://localhost:8082/#/login'

if (!fs.existsSync(EXPORT_FOLDER)){
  fs.mkdirSync(EXPORT_FOLDER);
}

const urlName = (url.parse(EXPORT_URL).hostname).replace(/\..*/g, '')
const currentDate = new Date()
const fileName = `${urlName}-${currentDate.toISOString().slice(0, -5).replace(/:/g, '-')}.pdf`
const resultedFilePath = path.resolve(__dirname, EXPORT_FOLDER, fileName)

async function run() {
  const chromeless = new Chromeless()

  const resultPath = await chromeless
    .goto(EXPORT_URL)
    .wait(1000)
    // .type('chromeless', 'input[name="q"]')
    // .press(13)
    // .wait('#resultStats')
    .pdf({ landscape: true })

  const fileFrom = fs.createReadStream(resultPath)
  const fileTo = fs.createWriteStream(resultedFilePath)
  fileFrom.pipe(fileTo)
  fileFrom.on('end', () => {
    fs.unlinkSync(resultPath)
  })
  cp.spawn('chrome', [encodeURIComponent(resultedFilePath)])

  await chromeless.end()
}

run().catch(console.error.bind(console))