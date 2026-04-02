const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const fs = require('fs')
const path = require('path')

module.exports = merge.smart(common, {
  mode: 'development',
  entry: './dev-server/index.js',
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dev-server',
    open: false,
    port: 8080,
    host: '0.0.0.0',
    disableHostCheck: true,
    before (app) {
      // Parse JSON body
      app.use(require('express').json({ limit: '50mb' }))

      // POST /api/save-map — overwrite map JSON file in dev-server/
      app.post('/api/save-map', (req, res) => {
        const { filename, data } = req.body
        if (!filename || !data) {
          return res.status(400).json({ error: 'filename and data required' })
        }
        // Only allow saving to dev-server/*.json
        const safe = path.basename(filename)
        if (!safe.endsWith('.json')) {
          return res.status(400).json({ error: 'must be a .json file' })
        }
        const dest = path.join(__dirname, 'dev-server', safe)
        fs.writeFileSync(dest, JSON.stringify(data, null, 2))
        console.log(`[save-map] saved ${dest}`)
        res.json({ ok: true, path: dest })
      })

      // GET /api/list-maps — list available map files
      app.get('/api/list-maps', (_req, res) => {
        const dir = path.join(__dirname, 'dev-server')
        const maps = fs.readdirSync(dir).filter(f => f.startsWith('map_') && f.endsWith('.json'))
        res.json(maps)
      })
    }
  }
})
