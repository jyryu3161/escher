import PlacedDiv from './PlacedDiv'

const FONT_FAMILIES = [
  { value: 'sans-serif', label: 'Sans-serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' }
]

const FONT_SIZES = [20, 30, 40, 50, 60, 80, 100, 150]

/**
 * TextEditInput
 */
export default class TextEditInput {
  constructor (selection, map, zoomContainer) {
    const div = selection.append('div')
          .attr('id', 'text-edit-input')
    this.placedDiv = PlacedDiv(div, map)
    this.placedDiv.hide()

    // Style toolbar
    const toolbar = div.append('div')
          .attr('class', 'style-toolbar')

    // Font family select
    this.fontFamilySelect = toolbar.append('select')
      .attr('class', 'style-font-family')
      .attr('title', 'Font family')
    FONT_FAMILIES.forEach(f => {
      this.fontFamilySelect.append('option')
        .attr('value', f.value)
        .text(f.label)
    })
    this.fontFamilySelect.on('change', () => this._onStyleChange())

    // Font size select
    this.fontSizeSelect = toolbar.append('select')
      .attr('class', 'style-font-size')
      .attr('title', 'Font size')
    FONT_SIZES.forEach(s => {
      this.fontSizeSelect.append('option')
        .attr('value', s)
        .text(s + 'px')
    })
    this.fontSizeSelect.on('change', () => this._onStyleChange())

    // Bold toggle
    this.boldBtn = toolbar.append('button')
      .attr('class', 'style-bold')
      .attr('title', 'Bold')
      .text('B')
    this.boldBtn.on('click', () => {
      const isActive = this.boldBtn.classed('active')
      this.boldBtn.classed('active', !isActive)
      this._onStyleChange()
    })

    // Italic toggle
    this.italicBtn = toolbar.append('button')
      .attr('class', 'style-italic')
      .attr('title', 'Italic')
      .text('I')
    this.italicBtn.node().style.fontStyle = 'italic'
    this.italicBtn.on('click', () => {
      const isActive = this.italicBtn.classed('active')
      this.italicBtn.classed('active', !isActive)
      this._onStyleChange()
    })

    // Text input
    this.input = div.append('input')

    this.map = map
    this.setUpMapCallbacks(map)
    this.zoomContainer = zoomContainer
    this.setUpZoomCallbacks(zoomContainer)

    this.isNew = false
    this.keepTextMode = false
  }

  setUpMapCallbacks (map) {
    // Input
    map.callback_manager.set('edit_text_label.text_edit_input', (target, coords) => {
      this.show(target, coords)
    })

    // new text_label
    map.callback_manager.set('new_text_label.text_edit_input', (coords, shiftKey) => {
      if (this.activeTarget !== null) {
        this._acceptChanges(this.activeTarget.target)
      }
      this.hide()
      this.keepTextMode = shiftKey || false
      this._addAndEdit(coords)
    })

    map.callback_manager.set('hide_text_label_editor.text_edit_input', () => {
      this.hide()
    })
  }

  setUpZoomCallbacks (zoomContainer) {
    zoomContainer.callbackManager.set('zoom.text_edit_input', () => {
      if (this.activeTarget) {
        this._acceptChanges(this.activeTarget.target)
      }
      if (this.is_visible()) {
        this.hide()
      }
    })
    zoomContainer.callbackManager.set('go_to.text_edit_input', () => {
      if (this.activeTarget) {
        this._acceptChanges(this.activeTarget.target)
      }
      if (this.is_visible()) {
        this.hide()
      }
    })
  }

  is_visible () { // eslint-disable-line camelcase
    return this.placedDiv.is_visible()
  }

  show (target, coords) {
    // save any existing edit
    if (this.activeTarget) {
      this._acceptChanges(this.activeTarget.target)
    }

    // set the current target
    this.activeTarget = { target, coords }

    // set the new value and style controls
    target.each(d => {
      this.input.node().value = d.text
      this._syncToolbar(d)
    })

    // place the input
    this.placedDiv.place(coords)
    this.input.node().focus()

    // escape key
    this.clearEscape = this.map.key_manager.addEscapeListener(() => {
      this._acceptChanges(target)
      if (this.is_visible()) this.hide()
    }, true)
    // enter key
    this.clearEnter = this.map.key_manager.addEnterListener(() => {
      this._acceptChanges(target)
      if (this.is_visible()) this.hide()
    }, true)
  }

  hide () {
    this.isNew = false

    // explicitly release focus before hiding
    this.input.node().blur()

    // hide the input
    this.placedDiv.hide()

    // clear the value
    this.input.attr('value', '')
    this.activeTarget = null

    // clear escape
    if (this.clearEscape) this.clearEscape()
    this.clearEscape = null
    // clear enter
    if (this.clearEnter) this.clearEnter()
    this.clearEnter = null
  }

  _syncToolbar (d) {
    // Set toolbar controls to match label's current style
    this.fontFamilySelect.node().value = d.font_family || 'sans-serif'
    this.fontSizeSelect.node().value = d.font_size || 50
    this.boldBtn.classed('active', (d.font_weight || 'bold') === 'bold')
    this.italicBtn.classed('active', (d.font_style || 'italic') === 'italic')
  }

  _onStyleChange () {
    if (!this.activeTarget) return

    const styleProps = {
      font_family: this.fontFamilySelect.node().value,
      font_size: parseInt(this.fontSizeSelect.node().value, 10),
      font_weight: this.boldBtn.classed('active') ? 'bold' : 'normal',
      font_style: this.italicBtn.classed('active') ? 'italic' : 'normal'
    }

    this.activeTarget.target.each(d => {
      this.map.edit_text_label_style(d.text_label_id, styleProps)
    })
  }

  _acceptChanges (target) {
    const value = this.input.node().value
    const wasNew = this.isNew
    const shouldKeepMode = this.keepTextMode

    // Clear state BEFORE switch_to_brush_mode to prevent reentrant calls.
    // _setMode('brush') triggers togglePanDrag → goTo → zoom event → go_to
    // callback, which checks activeTarget and would call _acceptChanges again,
    // causing infinite recursion / stack overflow.
    this.isNew = false
    this.activeTarget = null

    if (value === '') {
      // Delete the label
      target.each(d => {
        const selected = {}
        selected[d.text_label_id] = this.map.text_labels[d.text_label_id]
        this.map.delete_selectable({}, selected, true)
      })
    } else {
      // Set the text
      const textLabelIds = []
      target.each(d => {
        this.map.edit_text_label(d.text_label_id, value, true, wasNew)
        textLabelIds.push(d.text_label_id)
      })
    }
    // Auto-switch to brush mode after adding new text (unless Shift was held)
    if (wasNew && !shouldKeepMode) {
      this.map.callback_manager.run('switch_to_brush_mode')
    }
    this.keepTextMode = false
  }

  _addAndEdit (coords) {
    this.isNew = true

    // Make an empty label
    const textLabelId = this.map.new_text_label(coords, '')
    // Apply the cursor to the new label
    const sel = this.map.sel.select('#text-labels').selectAll('.text-label')
          .filter(d => d.text_label_id === textLabelId)
    sel.select('text').classed('edit-text-cursor', true)
    this.show(sel, coords)
  }
}
