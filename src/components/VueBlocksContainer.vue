<template>
  <div ref="root" class='vue-container' style='height: 100%'>
    <VueLink :lines='lines'/>
    <VueBlock v-for='block in blocks'
              :key='block.id'
              :model='block'
              :options='optionsForChild'
              @update='updateScene'
              @linkingStart='linkingStart(block, $event)'
              @linkingStop='linkingStop(block, $event)'
              @linkingBreak='linkingBreak(block, $event)'
              @select='blockSelect(block)'
              @delete='blockDelete(block)'
              @updatePosition='blockPositionUpdated(block, $event)'
    />
  </div>
</template>
<script setup>
import {computed, defineExpose, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import VueLink from "@/components/VueLink.vue";
import VueBlock from "@/components/VueBlock.vue";
import {getMousePosition} from "@/components/helpers/mouse.ts";
import merge from "deepmerge";

const root = ref(null)

const props = defineProps({
  blocksContent: {type: Array, default: []},
  scene: {
    type: Object,
    default: {blocks: [], links: [], container: {}},
    options: {
      type: Object
    }
  },
})

const dragging = ref(false)
const centerX = ref(0)
const centerY = ref(0)
const scale = ref(1)
const nodes = ref([])
const blocks = ref([])
const links = ref([])
const tempLink = ref(null)
const selectedBlock = ref(null)
const hasDragged = ref(false)

let mouseX = ref(0)
let mouseY = ref(0)

let lastMouseX = ref(0)
let lastMouseY = ref(0)

let minScale = ref(0.2)
let maxScale = ref(5)

let linking = ref(false)
let linkStartData = ref(null)

let inputSlotClassName = ref('inputSlot')

let defaultScene = ref({
  blocks: [],
  links: [],
  container: {}
})

const optionsForChild = computed(() => {
  return {
    width: 200,
    titleHeight: 20,
    scale: scale.value,
    inputSlotClassName: inputSlotClassName.value,
    center: {
      x: centerX.value,
      y: centerY.value
    }
  }
})
const container = computed(() => {
  return {
    centerX: centerX.value,
    centerY: centerY.value,
    scale: scale.value
  }
})
// Links calculate
const lines = computed(() => {
  let lines = []

  for (let link of links.value) {
    let originBlock = blocks.value.find(block => {
      return block.id === link.originID
    })

    let targetBlock = blocks.value.find(block => {
      return block.id === link.targetID
    })

    if (!originBlock || !targetBlock) {
      console.log('Remove invalid link', link)
      removeLink(link.id)
      continue
    }

    if (originBlock.id === targetBlock.id) {
      console.log('Loop detected, remove link', link)
      removeLink(link.id)
      continue
    }

    let originLinkPos = getConnectionPos(originBlock, link.originSlot, false)
    let targetLinkPos = getConnectionPos(targetBlock, link.targetSlot, true)

    if (!originLinkPos || !targetLinkPos) {
      console.log('Remove invalid link (slot not exist)', link)
      removeLink(link.id)
      continue
    }

    let x1 = originLinkPos.x
    let y1 = originLinkPos.y

    let x2 = targetLinkPos.x
    let y2 = targetLinkPos.y

    lines.push({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      style: {
        stroke: '#666',
        strokeWidth: 1 * scale.value,
        fill: 'none'
      },
      outlineStyle: {
        stroke: '#999',
        strokeWidth: 1 * scale.value,
        strokeOpacity: 0.6,
        fill: 'none'
      }
    })
  }

  if (tempLink.value) {
    tempLink.value.style = {
      stroke: '#999',
      strokeWidth: 1 * scale.value,
      fill: 'none'
    }

    lines.push(tempLink.value)
  }

  return lines
})

const blockPositionUpdated = (block, event) => {
  block.x = event.x
  block.y = event.y
}

const handleMove = (e) => {
  let mouse = getMousePosition(root.value, e)
  mouseX.value = mouse.x
  mouseY.value = mouse.y

  if (dragging.value) {
    let diffX = mouseX.value - lastMouseX.value
    let diffY = mouseY.value - lastMouseY.value

    lastMouseX.value = mouseX.value
    lastMouseY.value = mouseY.value

    centerX.value += diffX
    centerY.value += diffY

    hasDragged.value = true
  }

  if (linking.value && linkStartData.value) {
    let linkStartPos = getConnectionPos(linkStartData.value.block, linkStartData.value.slotNumber, false)
    tempLink.value = {
      x1: linkStartPos.x,
      y1: linkStartPos.y,
      x2: mouseX.value,
      y2: mouseY.value
    }
  }
}
const handleDown = (e) => {
  const target = e.target || e.srcElement
  if ((target === root.value || target.matches('svg, svg *')) && e.which === 1) {
    dragging.value = true

    let mouse = getMousePosition(root.value, e)
    mouseX.value = mouse.x
    mouseY.value = mouse.y

    lastMouseX.value = mouseX.value
    lastMouseY.value = mouseY.value

    deselectAll()
    if (e.preventDefault) e.preventDefault()
  }
}
const handleUp = (e) => {
  const target = e.target || e.srcElement

  if (dragging.value) {
    dragging.value = false

    if (hasDragged.value) {
      updateScene()
      hasDragged.value = false
    }
  }

  if (root.value.contains(target) && (typeof target.className !== 'string' || target.className.indexOf(inputSlotClassName.value) === -1)) {
    linking.value = false
    tempLink.value = null
    linkStartData.value = null
  }
}
const handleWheel = (e) => {
  const target = e.target || e.srcElement
  if (root.value.contains(target)) {
    let deltaScale = Math.pow(1.1, e.deltaY * -0.01)
    scale.value *= deltaScale

    if (scale.value < minScale.value) {
      scale.value = minScale.value
      return
    } else if (scale.value > maxScale.value) {
      scale.value = maxScale.value
      return
    }

    let zoomingCenter = {
      x: mouseX.value,
      y: mouseY.value
    }

    let deltaOffsetX = (zoomingCenter.x - centerX.value) * (deltaScale - 1)
    let deltaOffsetY = (zoomingCenter.y - centerY.value) * (deltaScale - 1)

    centerX.value -= deltaOffsetX
    centerY.value -= deltaOffsetY

    updateScene()
  }
}
// Processing
const getConnectionPos = (block, slotNumber, isInput) => {
  if (!block || slotNumber === -1) {
    return undefined
  }

  let x = 0
  let y = 0

  x += block.x
  y += block.y

  y += optionsForChild.value.titleHeight

  if (isInput && block.inputs.length > slotNumber) {
  } else if (!isInput && block.outputs.length > slotNumber) {
    x += optionsForChild.value.width
  } else {
    console.error('slot ' + slotNumber + ' not found, is input: ' + isInput, block)
    return undefined
  }

  // (height / 2 + blockBorder + padding)
  y += (16 / 2 + 1 + 2)
  //  + (height * slotNumber)
  y += (16 * slotNumber)

  x *= scale.value
  y *= scale.value

  x += centerX.value
  y += centerY.value

  return {x: x, y: y}
}
// Linking
const linkingStart = (block, slotNumber) => {
  linkStartData.value = {block: block, slotNumber: slotNumber}
  let linkStartPos = getConnectionPos(linkStartData.value.block, linkStartData.value.slotNumber, false)
  tempLink.value = {
    x1: linkStartPos.x,
    y1: linkStartPos.y,
    x2: mouseX.value,
    y2: mouseY.value
  }

  linking.value = true
}
const linkingStop = (targetBlock, slotNumber) => {
  if (linkStartData.value && targetBlock && slotNumber > -1) {
    links.value = links.value.filter(value => {
      return !(value.targetID === targetBlock.id && value.targetSlot === slotNumber)
    })

    let maxID = Math.max(0, ...links.value.map(function (o) {
      return o.id
    }))

    // skip if looping
    if (linkStartData.value.block.id !== targetBlock.id) {
      links.value.push({
        id: maxID + 1,
        originID: linkStartData.value.block.id,
        originSlot: linkStartData.value.slotNumber,
        targetID: targetBlock.id,
        targetSlot: slotNumber
      })
      updateScene()
    }
  }

  linking.value = false
  tempLink.value = null
  linkStartData.value = null
}
const linkingBreak = (targetBlock, slotNumber) => {
  if (targetBlock && slotNumber > -1) {
    let findLink = links.value.find(value => {
      return value.targetID === targetBlock.id && value.targetSlot === slotNumber
    })

    if (findLink) {
      let findBlock = blocks.value.find(value => {
        return value.id === findLink.originID
      })

      links.value = links.value.filter(value => {
        return !(value.targetID === targetBlock.id && value.targetSlot === slotNumber)
      })

      linkingStart(findBlock, findLink.originSlot)
      updateScene()
    }
  }
}
const removeLink = (linkID) => {
  links.value = links.value.filter(value => {
    return !(value.id === linkID)
  })
}

const getBoundingClientRect = () => {
  return root.value.getBoundingClientRect()
}

// Blocks
const addNewBlock = (nodeName, x, y) => {
  let maxID = Math.max(0, ...blocks.value.map(function (o) {
    return o.id
  }))

  let node = nodes.value.find(n => {
    return n.name === nodeName
  })

  if (!node) {
    return
  }
  let block = createBlock(node, maxID + 1)

  // if x or y not set, place block to center
  if (x === undefined || y === undefined) {
    x = (root.value.clientWidth / 2 - centerX.value) / scale.value
    y = (root.value.clientHeight / 2 - centerY.value) / scale.value
  } else {
    x = (x - centerX.value) / scale.value
    y = (y - centerY.value) / scale.value
  }

  block.x = x
  block.y = y
  blocks.value.push(block)

  updateScene()
}
const createBlock = (node, id) => {
  let inputs = []
  let outputs = []
  let values = {}

  node.fields.forEach(field => {
    if (field.attr === 'input') {
      inputs.push({
        name: field.name,
        label: field.label || field.name
      })
    } else if (field.attr === 'output') {
      outputs.push({
        name: field.name,
        label: field.label || field.name
      })
    } else {
      if (!values[field.attr]) {
        values[field.attr] = {}
      }

      let newField = merge({}, field)
      delete newField['name']
      delete newField['attr']

      if (!values[field.attr][field.name]) {
        values[field.attr][field.name] = {}
      }

      values[field.attr][field.name] = newField
    }
  })

  return {
    id: id,
    x: 0,
    y: 0,
    selected: false,
    name: node.name,
    title: node.title || node.name,
    inputs: inputs,
    outputs: outputs,
    values: values
  }
}
const deselectAll = (withoutID = null) => {
  blocks.value.forEach((value) => {
    if (value.id !== withoutID && value.selected) {
      blockDeselect(value)
    }
  })
}

const emit = defineEmits(['blockSelect', 'blockDeselect', 'update:scene'])

// Events
const blockSelect = (block) => {
  block.selected = true
  selectedBlock.value = block
  deselectAll(block.id)
  emit('blockSelect', block)
}
const blockDeselect = (block) => {
  block.selected = false
  if (block &&
      selectedBlock.value &&
      selectedBlock.value.id === block.id
  ) {
    selectedBlock.value = null
  }
  emit('blockDeselect', block)
}
const blockDelete = (block) => {
  if (block.selected) {
    blockDeselect(block)
  }
  links.value.forEach(l => {
    if (l.originID === block.id || l.targetID === block.id) {
      removeLink(l.id)
    }
  })
  blocks.value = blocks.value.filter(b => {
    return b.id !== block.id
  })
  updateScene()
}
//
const prepareBlocks = (blocks) => {
  return blocks.map(block => {
    let node = nodes.value.find(n => {
      return n.name === block.name
    })

    if (!node) {
      return null
    }

    let newBlock = createBlock(node, block.id)

    newBlock = merge(newBlock, block, {
      arrayMerge: (d, s) => {
        return s.length === 0 ? d : s
      }
    })

    return newBlock
  }).filter(b => {
    return !!b
  })
}
const prepareBlocksLinking = (blocks, links) => {
  if (!blocks) {
    return []
  }

  let newBlocks = []

  blocks.forEach(block => {
    let inputs = links.filter(link => {
      return link.targetID === block.id
    })

    let outputs = links.filter(link => {
      return link.originID === block.id
    })

    block.inputs.forEach((s, index) => {
      // is linked
      block.inputs[index].active = inputs.some(i => i.targetSlot === index)
    })

    block.outputs.forEach((s, index) => {
      // is linked
      block.outputs[index].active = outputs.some(i => i.originSlot === index)
    })

    newBlocks.push(block)
  })

  return newBlocks
}
const importBlocksContent = () => {
  if (props.blocksContent) {
    nodes.value = merge([], props.blocksContent)
  }
}
const importScene = () => {
  let _scene = merge(defaultScene.value, props.scene)

  let _blocks = prepareBlocks(_scene.blocks)
  _blocks = prepareBlocksLinking(_blocks, _scene.links)

  // set last selected after update blocks from props
  if (selectedBlock.value) {
    let block = _blocks.find(b => selectedBlock.value.id === b.id)
    if (block) {
      block.selected = true
    }
  }

  blocks.value = _blocks
  links.value = merge([], _scene.links)

  let container = _scene.container
  if (container.centerX) {
    centerX.value = container.centerX
  }
  if (container.centerY) {
    centerY.value = container.centerY
  }
  if (container.scale) {
    scale.value = container.scale
  }
}
const exportScene = () => {
  let clonedBlocks = merge([], blocks.value)
  let _blocks = clonedBlocks.map(value => {
    delete value['inputs']
    delete value['outputs']
    delete value['selected']
    return value
  })

  return {
    blocks: _blocks,
    links: links.value,
    container: container.value
  }
}
const updateScene = () => {
  emit('update:scene', exportScene())
}

onMounted(() => {
  if (document) {
    document.documentElement.addEventListener('mousemove', handleMove, true)
    document.documentElement.addEventListener('mousedown', handleDown, true)
    document.documentElement.addEventListener('mouseup', handleUp, true)
    document.documentElement.addEventListener('wheel', handleWheel, true)
  }
  centerX.value = root.value.clientWidth / 2
  centerY.value = root.value.clientHeight / 2

  importBlocksContent()
  importScene()
})

onBeforeUnmount(() => {
  if (document) {
    document.documentElement.removeEventListener('mousemove', handleMove, true)
    document.documentElement.removeEventListener('mousedown', handleDown, true)
    document.documentElement.removeEventListener('mouseup', handleUp, true)
    document.documentElement.removeEventListener('wheel', handleWheel, true)
  }
})

watch(props.blocksContent, (_new, _pre) => {
  importBlocksContent()
})

watch(props.scene, (_new, _pre) => {
  importScene()
})

defineExpose({addNewBlock, getBoundingClientRect})
</script>

<style lang='less' scoped>
.vue-container {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
