<script setup lang='ts'>
import VueBlocksContainer from '../components/VueBlocksContainer.vue'
import VueBlockProperty from '../components/VueBlockProperty.vue'
import merge from 'deepmerge'
import { reactive, ref, nextTick, computed } from 'vue'
import domHelper from '../components/helpers/mouse.ts'

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
        name: 'Stop2',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'Stop3',
        type: 'event',
        attr: 'input'
      },
      {
        name: 'Stop4',
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
let container = ref<HTMLImageElement | null>(null)
let menuRef = ref(null)
let scene = ref({
  'blocks': [
    {
      'id': 2,
      'x': -700,
      'y': -69,
      'name': 'Chat message',
      'title': 'Chat message',
      'values': {
        'property': [
          {
            'name': 'message',
            'type': 'string'
          }
        ]
      }
    },
    {
      'id': 6,
      'x': -440,
      'y': -15.5,
      'name': 'delay',
      'title': 'Delay',
      'values': {
        'property': {
          'delay': {
            'label': 'Delay (s)',
            'type': 'number',
            'value': 1
          }
        }
      }
    }
  ],
  'links': [
    {
      'id': 10,
      'originID': 2,
      'originSlot': 0,
      'targetID': 6,
      'targetSlot': 0
    }
  ],
  'container': {
    'centerX': 924,
    'centerY': 258,
    'scale': 1
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
  selectedBlock.value = block
}
const updateScene = (_scene) => {
  scene.value = _scene
}
const deselectBlock = (block) => {
  // console.log('deselect', block)
  selectedBlock.value = null
}
const filteredBlocks = (type) => {
  return blocks.filter(value => {
    return value.family === type
  })
}
const addBlock = () => {
  container.value.addNewBlock(selectedType.value)
}
const saveProperty = (val) => {
  let _scene = scene.value
  let block = _scene.blocks.find(b => {
    return b.id === selectedBlock.value.id
  })
  block.values.property = val

  scene.value = merge({}, _scene)
}
const showContextMenu = (e) => {
  if (!useContextMenu.value) return
  if (e.preventDefault) e.preventDefault()

  contextMenu.isShow = true
  contextMenu.mouseX = e.x
  contextMenu.mouseY = e.y

  nextTick(function() {
    setMenu(e.y, e.x)
    menuRef.value.focus()
  })
}
const setMenu = (top, left) => {
  let border = 5
  let contextMenuEl = menuRef.value
  let containerElRect = container.value.getBoundingClientRect()
  let largestWidth = containerElRect.right - contextMenuEl.offsetWidth - border
  let largestHeight = containerElRect.bottom - contextMenuEl.offsetHeight - border

  console.log(containerElRect)

  if (left > largestWidth) left = largestWidth
  if (top > largestHeight) top = largestHeight

  contextMenu.top = top
  contextMenu.left = left
}
const addBlockContextMenu = (name) => {
  let offset = domHelper.getOffsetRect(container.value)
  let x = contextMenu.mouseX - offset.left
  let y = contextMenu.mouseY - offset.top

  container.value.addNewBlock(name, x, y)
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
  <div class='wrapper'>
    <VueBlocksContainer
      @contextmenu.native='showContextMenu'
      @click.native='closeContextMenu'
      ref='container'
      :blocksContent='blocks'
      :scene='scene'
      @blockSelect='selectBlock'
      @blockDeselect='deselectBlock'
      @updateScene='updateScene'
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

    <ul id='contextMenu' ref='menuRef' tabindex='-1' v-show='contextMenu.isShow'
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
.wrapper {
  width: ~"calc(100% - 40px)";
  height: ~"calc(100% - 40px)";
  padding: 20px 0 0 20px;
}

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