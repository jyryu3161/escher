import model from './JS66_model.json'
import mapWLP from './map_wlp.json'
import mapChain from './map_chain_elongation.json'
import mapAlcohol from './map_alcohol_production.json'
import mapAlcoholPathways from './map_alcohol_production_pathways.json'
import { Builder, libs } from '../src/main'

// Select map based on ?map= query parameter
const params = new URLSearchParams(window.location.search)
const mapKey = params.get('map') || 'wlp'

const MAPS = {
  wlp: { data: mapWLP, file: 'map_wlp.json', label: 'Wood-Ljungdahl Pathway' },
  chain: { data: mapChain, file: 'map_chain_elongation.json', label: 'Chain Elongation' },
  alcohol: { data: mapAlcohol, file: 'map_alcohol_production.json', label: 'Alcohol Production' },
  'alcohol-pathways': { data: mapAlcoholPathways, file: 'map_alcohol_production_pathways.json', label: 'Alcohol Production Pathways' }
}

const current = MAPS[mapKey] || MAPS.wlp

document.title = 'Escher - ' + current.label

window.builder = new Builder( // eslint-disable-line no-new
  current.data,
  model,
  null,
  libs.d3_select('#root'),
  {
    fill_screen: true,
    never_ask_before_quit: false
  }
)

// Debug: expose stretch test
window.testStretch = function () {
  var b = window.builder
  console.log('mode:', b.mode)
  var sel = Object.keys(b.map.getSelectedNodes())
  console.log('selected nodes:', sel.length)
  console.log('stretchModeEnabled:', b.map.behavior.stretchModeEnabled)
  try {
    b.toggle_stretch()
    console.log('toggle_stretch called OK')
    console.log('stretchModeEnabled after:', b.map.behavior.stretchModeEnabled)
    console.log('stretch-box exists:', b.map.sel.selectAll('#stretch-box').size())
  } catch (e) {
    console.error('ERROR in toggle_stretch:', e)
  }
}

// ── Save toolbar (persists across map loads) ──
var activeFile = current.file

var btnCss =
  'padding:5px 12px;font-size:12px;cursor:pointer;border:1px solid #999;' +
  'border-radius:3px;background:#fff;color:#333;box-shadow:0 1px 3px rgba(0,0,0,.15);' +
  'pointer-events:auto;'

function getShortName (filename) {
  return filename.replace('map_', '').replace('.json', '')
}

function injectToolbar () {
  // Remove previous toolbar if any
  var old = document.getElementById('escher-save-toolbar')
  if (old) old.parentNode.removeChild(old)

  var target = document.querySelector('.fill-screen-div') ||
               document.querySelector('.escher-container') ||
               document.body

  var toolbar = document.createElement('div')
  toolbar.id = 'escher-save-toolbar'
  toolbar.setAttribute('style',
    'position:absolute;top:4px;right:8px;z-index:9999;display:flex;' +
    'gap:6px;align-items:center;pointer-events:auto;')

  // Save button
  var saveBtn = document.createElement('button')
  saveBtn.textContent = 'Save (' + getShortName(activeFile) + ')'
  saveBtn.setAttribute('style', btnCss)
  saveBtn.addEventListener('click', function () {
    try {
      var mapData = window.builder.map.map_for_export()
    } catch (e) {
      console.error('[save-toolbar] map_for_export failed:', e)
      saveBtn.textContent = 'Error!'
      saveBtn.style.background = '#f8d7da'
      setTimeout(function () {
        saveBtn.textContent = 'Save (' + getShortName(activeFile) + ')'
        saveBtn.style.background = '#fff'
      }, 2000)
      return
    }
    fetch('/api/save-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: activeFile, data: mapData })
    }).then(function (r) { return r.json() })
      .then(function (json) {
        if (json.ok) {
          saveBtn.textContent = 'Saved!'
          saveBtn.style.background = '#d4edda'
          setTimeout(function () {
            saveBtn.textContent = 'Save (' + getShortName(activeFile) + ')'
            saveBtn.style.background = '#fff'
          }, 1500)
        }
      })
      .catch(function (err) {
        console.error('[save-toolbar] save failed:', err)
        saveBtn.textContent = 'Save failed!'
        saveBtn.style.background = '#f8d7da'
        setTimeout(function () {
          saveBtn.textContent = 'Save (' + getShortName(activeFile) + ')'
          saveBtn.style.background = '#fff'
        }, 2000)
      })
  })
  toolbar.appendChild(saveBtn)

  // Save-as button
  var saveAsBtn = document.createElement('button')
  saveAsBtn.textContent = 'Save As...'
  saveAsBtn.setAttribute('style', btnCss)
  saveAsBtn.addEventListener('click', function () {
    var name = window.prompt('Filename:', activeFile.replace('.json', '_v2.json'))
    if (!name) return
    var fname = name.endsWith('.json') ? name : name + '.json'
    try {
      var mapData = window.builder.map.map_for_export()
    } catch (e) {
      console.error('[save-toolbar] map_for_export failed:', e)
      return
    }
    fetch('/api/save-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: fname, data: mapData })
    }).then(function (r) { return r.json() })
      .then(function (json) {
        if (json.ok) {
          activeFile = fname
          saveBtn.textContent = 'Save (' + getShortName(activeFile) + ')'
          saveAsBtn.textContent = 'Saved!'
          saveAsBtn.style.background = '#d4edda'
          setTimeout(function () {
            saveAsBtn.textContent = 'Save As...'
            saveAsBtn.style.background = '#fff'
          }, 2000)
        }
      })
      .catch(function (err) {
        console.error('[save-toolbar] save-as failed:', err)
      })
  })
  toolbar.appendChild(saveAsBtn)

  target.appendChild(toolbar)
  console.log('[save-toolbar] injected, active file:', activeFile)
}

// Inject toolbar after initial render
setTimeout(injectToolbar, 2000)

// Re-inject toolbar after every map load so it stays on top and tracks the new map
window.builder.callback_manager.set('load_map.save_toolbar', function (mapData) {
  // Try to match loaded map to a known MAPS entry by map_name
  if (mapData && mapData[0] && mapData[0].map_name) {
    var loadedName = mapData[0].map_name
    var matched = false
    Object.keys(MAPS).forEach(function (key) {
      if (MAPS[key].label === loadedName) {
        activeFile = MAPS[key].file
        matched = true
      }
    })
    if (!matched) {
      // Derive filename from map_name for maps loaded from file
      var safeName = loadedName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
      activeFile = 'map_' + safeName + '.json'
    }
  }
  setTimeout(injectToolbar, 500)
})
