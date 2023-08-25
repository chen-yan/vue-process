/**
 * @param element {HTMLElement}
 * @return {{top: number, left: number}}
 */
export function getOffsetRect(element) {
  let box = element.getBoundingClientRect()
  let {pageYOffset: scrollTop, pageXOffset: scrollLeft} = window
  let top = box.top + scrollTop
  let left = box.left + scrollLeft

  return {top: Math.round(top), left: Math.round(left)}
}

/**
 * @param event {MouseEvent}
 * @param element {HTMLElement}
 * @return {{x: number, y: number}}
 */
export function getMousePosition(element, event) {
  let mouseX = event.pageX || event.clientX + document.documentElement.scrollLeft
  let mouseY = event.pageY || event.clientY + document.documentElement.scrollTop

  let offset = getOffsetRect(element)
  let x = mouseX - offset.left
  let y = mouseY - offset.top

  return {
    x: x,
    y: y
  }
}

export default {
  getOffsetRect,
  getMousePosition
}
