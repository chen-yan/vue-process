<script setup lang='ts'>
import VueBlocksContainer from '../components/VueBlocksContainer.vue'
import VueBlockProperty from '../components/VueBlockProperty.vue'
import merge from 'deepmerge'
import { reactive, ref, nextTick, computed } from 'vue'
import domHelper from '../components/helpers/dom.js'

const blocks = reactive([
  {
    name: 'text',
    title: 'Text',
    family: 'Animations',
    description: 'Show text',
    fields: [
      {
        name: 'text',
        label: 'Text',
        type: 'string',
        attr: 'property'
      },
      {
        name: 'delay',
        label: 'Delay (s)',
        type: 'number',
        attr: 'property'
      },
      {
        name: 'Show',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'Hide',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'onShow',
        type: 'event',
        attr: 'output'
      },
      {
        name: 'onHide',
        type: 'event',
        attr: 'output'
      }
    ]
  },
  {
    name: 'animation',
    title: 'Animation',
    family: 'Animations',
    description: 'Show animation',
    fields: [
      {
        name: 'animation',
        label: 'Animation',
        type: 'animation',
        attr: 'property'
      },
      {
        name: 'Play',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'Stop',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'onEnd',
        type: 'event',
        attr: 'output'
      }
    ]
  },
  {
    name: 'Chat message',
    family: 'Events',
    description: '',
    fields: [
      {
        name: 'message',
        label: 'Activation message',
        type: 'string',
        attr: 'property'
      },
      {
        name: 'onMessage',
        type: 'event',
        attr: 'output'
      }
    ]
  },
  {
    name: 'delay',
    title: 'Delay',
    family: 'Time',
    description: '',
    fields: [
      {
        name: 'delay',
        label: 'Delay (s)',
        type: 'number',
        attr: 'property',
        value: 1.0
      },
      {
        name: 'input',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'output',
        type: 'event',
        attr: 'output'
      }
    ]
  },
  {
    name: 'shortcuts',
    title: 'Shortcuts',
    family: 'Events',
    description: 'Press shortcut for call event',
    fields: [
      {
        name: 'keys',
        label: 'Activation keys',
        type: 'keys',
        attr: 'property'
      },
      {
        name: 'onPress',
        type: 'event',
        attr: 'output'
      }
    ]
  },
  {
    name: 'splitter',
    title: 'Splitter',
    family: 'Helpers',
    description: 'Press shortcut for call event',
    fields: [
      {
        name: 'input',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'output',
        type: 'event',
        attr: 'output'
      },
      {
        name: 'output',
        type: 'event',
        attr: 'output'
      },
      {
        name: 'output',
        type: 'event',
        attr: 'output'
      },
      {
        name: 'output',
        type: 'event',
        attr: 'output'
      }
    ]
  }
])
let container = ref(null)
let scene = reactive({
  blocks: [
    {
      id: 2,
      x: -700,
      y: -69,
      name: 'Chat message',
      title: 'Chat message',
      values: {
        property: [
          {
            name: 'message',
            type: 'string'
          }
        ]
      }
    },
    {
      id: 4,
      x: -157,
      y: -68.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 5,
      x: 136,
      y: -48.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 6,
      x: -440,
      y: -15.5,
      name: 'delay',
      title: 'Delay',
      values: {
        property: {
          delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
          }
        }
      }
    },
    {
      id: 7,
      x: -694,
      y: 60.5,
      name: 'shortcuts',
      title: 'Shortcuts',
      values: {
        property: {
          keys: {
            label: 'Activation keys',
            type: 'keys'
          }
        }
      }
    },
    {
      id: 8,
      x: -163,
      y: 59.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 9,
      x: -429,
      y: 125.5,
      name: 'delay',
      title: 'Delay',
      values: {
        property: {
          delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
          }
        }
      }
    },
    {
      id: 10,
      x: 126,
      y: 127.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 11,
      x: -856,
      y: 252.5,
      name: 'shortcuts',
      title: 'Shortcuts',
      values: {
        property: {
          keys: {
            label: 'Activation keys',
            type: 'keys'
          }
        }
      }
    },
    {
      id: 12,
      x: -616,
      y: 319.5,
      name: 'delay',
      title: 'Delay',
      values: {
        property: {
          delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
          }
        }
      }
    },
    {
      id: 13,
      x: -381,
      y: 252.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 14,
      x: 166,
      y: 266.5,
      name: 'text',
      title: 'Text',
      values: {
        property: {
          text: {
            label: 'Text',
            type: 'string'
          }
        }
      }
    },
    {
      id: 15,
      x: -149,
      y: 269.5,
      name: 'delay',
      title: 'Delay',
      values: {
        property: {
          delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
          }
        }
      }
    },
    {
      id: 16,
      x: 413,
      y: 267.5,
      name: 'animation',
      title: 'Animation',
      values: {
        property: {
          animation: {
            label: 'Animation',
            type: 'animation'
          }
        }
      }
    },
    {
      id: 17,
      x: 13,
      y: 380.5,
      name: 'delay',
      title: 'Delay',
      values: {
        property: {
          delay: {
            label: 'Delay (s)',
            type: 'number',
            value: 1
          }
        }
      }
    }
  ],
  links: [
    {
      id: 3,
      originID: 2,
      originSlot: 0,
      targetID: 4,
      targetSlot: 0
    },
    {
      id: 6,
      originID: 7,
      originSlot: 0,
      targetID: 8,
      targetSlot: 0
    },
    {
      id: 7,
      originID: 7,
      originSlot: 0,
      targetID: 9,
      targetSlot: 0
    },
    {
      id: 8,
      originID: 9,
      originSlot: 0,
      targetID: 10,
      targetSlot: 0
    },
    {
      id: 9,
      originID: 9,
      originSlot: 0,
      targetID: 8,
      targetSlot: 1
    },
    {
      id: 10,
      originID: 2,
      originSlot: 0,
      targetID: 6,
      targetSlot: 0
    },
    {
      id: 11,
      originID: 6,
      originSlot: 0,
      targetID: 4,
      targetSlot: 1
    },
    {
      id: 12,
      originID: 4,
      originSlot: 1,
      targetID: 5,
      targetSlot: 0
    },
    {
      id: 13,
      originID: 11,
      originSlot: 0,
      targetID: 13,
      targetSlot: 0
    },
    {
      id: 14,
      originID: 11,
      originSlot: 0,
      targetID: 12,
      targetSlot: 0
    },
    {
      id: 15,
      originID: 12,
      originSlot: 0,
      targetID: 13,
      targetSlot: 1
    },
    {
      id: 16,
      originID: 13,
      originSlot: 1,
      targetID: 15,
      targetSlot: 0
    },
    {
      id: 17,
      originID: 15,
      originSlot: 0,
      targetID: 14,
      targetSlot: 0
    },
    {
      id: 18,
      originID: 14,
      originSlot: 0,
      targetID: 16,
      targetSlot: 0
    },
    {
      id: 19,
      originID: 14,
      originSlot: 1,
      targetID: 16,
      targetSlot: 1
    },
    {
      id: 20,
      originID: 15,
      originSlot: 0,
      targetID: 17,
      targetSlot: 0
    },
    {
      id: 21,
      originID: 17,
      originSlot: 0,
      targetID: 14,
      targetSlot: 1
    }
  ],
  container: {
    centerX: 1042,
    centerY: 140,
    scale: 1
  }
})
let selectedBlock = ref(null)
let selectedType = ref('delay')
let useContextMenu = ref(true)
let contextMenu = reactive({
  isShow: false,
  mouseX: 0,
  mouseY: 0,
  top: 0,
  left: 0
})

const selectBlock = (block) => {
  console.log('select', block)
  selectedBlock.value = block
}
const deselectBlock = (block) => {
  console.log('deselect', block)
  selectedBlock.value = null
}
const filteredBlocks = (type) => {
  return blocks.filter(value => {
    return value.family === type
  })
}
const addBlock = () => {
  container.addNewBlock(selectedType.value)
}
const saveProperty = (val) => {
  console.log(val)

  let _scene = scene
  let block = _scene.blocks.find(b => {
    return b.id === selectedBlock.value.id
  })
  block.values.property = val

  scene = merge({}, _scene)
}
const showContextMenu = (e) => {
  if (!useContextMenu.value) return
  if (e.preventDefault) e.preventDefault()

  contextMenu.isShow = true
  contextMenu.mouseX = e.x
  contextMenu.mouseY = e.y

  nextTick(function() {
    setMenu(e.y, e.x)
    contextMenu.focus()
  })
}
const setMenu = (top, left) => {
  let border = 5
  let contextMenuEl = contextMenu
  let containerElRect = container.$el.getBoundingClientRect()
  let largestWidth = containerElRect.right - contextMenuEl.offsetWidth - border
  let largestHeight = containerElRect.bottom - contextMenuEl.offsetHeight - border

  console.log(container)
  console.log(containerElRect)

  if (left > largestWidth) left = largestWidth
  if (top > largestHeight) top = largestHeight

  contextMenu.top = top
  contextMenu.left = left
}
const addBlockContextMenu = (name) => {
  let offset = domHelper.getOffsetRect(container.$el)
  let x = contextMenu.mouseX - offset.left
  let y = contextMenu.mouseY - offset.top

  container.addNewBlock(name, x, y)
  closeContextMenu()
}
const closeContextMenu = () => {
  contextMenu.isShow = false
}

const selectedBlockProperty = computed(() => {
  if (!selectedBlock.value || !selectedBlock.value.values || !selectedBlock.value.values.property) {
    return null
  }

  return selectedBlock.value.values.property
})
const selectBlocksType = computed(() => {
  return blocks.map(b => {
    return b.family
  }).filter((value, index, array) => {
    return array.indexOf(value) === index
  })
})
</script>

<template>
  <div style='width: 100%; height: 100vh'>
    <VueBlocksContainer
      @contextmenu.native='showContextMenu'
      @click.native='closeContextMenu'
      ref='container'
      :blocksContent='blocks'
      :scene.sync='scene'
      @blockSelect='selectBlock'
      @blockDeselect='deselectBlock'
      class='container' />
    <VueBlockProperty :property='selectedBlockProperty' @save='saveProperty' />
    <label>
      <select name='type' v-model='selectedType'>
        <template v-for='type in selectBlocksType'>
          <optgroup :label='type'>
            <option v-for='block in filteredBlocks(type)' :value='block.name'>{{ block.title || block.name }}</option>
          </optgroup>
        </template>
      </select>
    </label>
    <button @click.stop='addBlock'>Add</button>
    |
    <label for='useContextMenu'>
      <input type='checkbox' v-model='useContextMenu' id='useContextMenu'>Use right click for Add blocks
    </label>

    <ul id='contextMenu' ref='contextMenu' tabindex='-1' v-show='contextMenu.isShow'
        @blur='closeContextMenu'
        :style="{top: contextMenu.top + 'px', left: contextMenu.left + 'px'}">
      <template v-for='type in selectBlocksType'>
        <li class='label'>{{ type }}</li>
        <li v-for='block in filteredBlocks(type)'
            @click='addBlockContextMenu(block.name)'>{{ block.title || block.name }}
        </li>
      </template>
    </ul>
  </div>
</template>

<style lang='less'>
.container {
  width: 100%;
  height: ~"calc(100% - 50px)";
  border: 1px solid black;
}

#contextMenu {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid black;
  padding: 5px;
  margin: 0;

  li {
    &.label {
      color: gray;
      font-size: 90%;
    }

    list-style: none;
  }

  &:focus {
    outline: none;
  }
}
</style>