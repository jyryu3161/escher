import * as utils from './utils'
import { drag as d3Drag } from 'd3-drag'
import {
  mouse as d3Mouse,
  event
} from 'd3-selection'

/**
 * DirectionArrow. A constructor for an arrow that can be rotated and dragged,
 * and supplies its direction.
 * @param {D3 Selection} sel - The sel to render the arrow in.
 */
export default class DirectionArrow {
  constructor (sel) {
    this.arrowContainer = sel.append('g')
      .attr('id', 'direction-arrow-container')
      .attr('transform', 'translate(0,0)rotate(0)')

    this.arrow = this.arrowContainer.append('path')
      .classed('direction-arrow', true)
      .attr('d', 'M0 -5 L0 5 L20 5 L20 10 L30 0 L20 -10 L20 -5 Z')
      .style('visibility', 'hidden')
      .attr('transform', 'translate(30,0)scale(2.5)')

    this.sel = sel
    this.center = { x: 0, y: 0 }

    this._setupDrag()
    this.dragging = false

    this.isVisible = false
    this.show()

    // Track pressed arrow keys for diagonal detection
    this._pressedKeys = new Set()
    this._setupDiagonalKeys()
  }

  /**
   * Move the arrow to coords.
   */
  setLocation (coords) {
    this.center = coords
    var transform = utils.d3_transform_catch(this.arrowContainer.attr('transform'))
    this.arrowContainer.attr('transform',
                             'translate(' + coords.x + ',' + coords.y +
                             ')rotate(' + transform.rotate + ')')
  }

  /**
   * Rotate the arrow to rotation.
   */
  setRotation (rotation) {
    var transform = utils.d3_transform_catch(this.arrowContainer.attr('transform'))
    this.arrowContainer.attr('transform',
                              'translate(' + transform.translate + ')rotate(' + rotation + ')')
  }

  /**
   * Displace the arrow rotation by a set amount.
   */
  displaceRotation (dRotation) {
    var transform = utils.d3_transform_catch(this.arrowContainer.attr('transform'))
    this.arrowContainer.attr('transform',
                              'translate(' + transform.translate + ')' +
                              'rotate(' + (transform.rotate + dRotation) + ')')
  }

  /**
   * Returns the arrow rotation.
   */
  getRotation () {
    return utils.d3_transform_catch(this.arrowContainer.attr('transform')).rotate
  }

  toggle (onOff) {
    if (onOff === undefined) this.isVisible = !this.isVisible
    else this.isVisible = onOff
    this.arrow.style('visibility', this.isVisible ? 'visible' : 'hidden')
  }

  show () {
    this.toggle(true)
  }

  hide () {
    this.toggle(false)
  }

  right () {
    this.setRotation(0)
  }

  down () {
    this.setRotation(90)
  }

  left () {
    this.setRotation(180)
  }

  up () {
    this.setRotation(270)
  }

  /**
   * Set up keydown/keyup listeners for diagonal arrow key combinations.
   * When two arrow keys are held simultaneously, rotate to the diagonal.
   */
  _setupDiagonalKeys () {
    const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

    // Map of two-key combos to diagonal rotations
    const DIAGONALS = {
      'ArrowUp+ArrowRight': 315,    // up-right
      'ArrowRight+ArrowDown': 45,   // down-right
      'ArrowDown+ArrowLeft': 135,   // down-left
      'ArrowLeft+ArrowUp': 225      // up-left
    }

    const getComboRotation = () => {
      if (this._pressedKeys.size !== 2) return null
      const sorted = Array.from(this._pressedKeys).sort()
      const key = sorted.join('+')
      return DIAGONALS[key] !== undefined ? DIAGONALS[key] : null
    }

    document.addEventListener('keydown', (e) => {
      if (!ARROW_KEYS.has(e.key)) return
      this._pressedKeys.add(e.key)

      const diag = getComboRotation()
      if (diag !== null) {
        e.preventDefault()
        this.setRotation(diag)
      }
    })

    document.addEventListener('keyup', (e) => {
      if (!ARROW_KEYS.has(e.key)) return
      this._pressedKeys.delete(e.key)
    })

    // Clear pressed keys when window loses focus
    window.addEventListener('blur', () => {
      this._pressedKeys.clear()
    })
  }

  _setupDrag () {
    var drag = d3Drag()
        .on('start', d => {
          // silence other listeners
          event.sourceEvent.stopPropagation()
          this.dragging = true
        })
        .on('drag', d => {
          const displacement = {
            x: event.dx,
            y: event.dy
          }
          const location = {
            x: d3Mouse(this.sel.node())[0],
            y: d3Mouse(this.sel.node())[1]
          }
          const dAngle = utils.angle_for_event(displacement, location,
                                               this.center)
          this.displaceRotation(utils.to_degrees(dAngle))
        })
        .on('end', d => {
          setTimeout(() => { this.dragging = false }, 200)
        })
    this.arrowContainer.call(drag)
  }
}
