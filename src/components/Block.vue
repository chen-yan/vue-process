<template>
  <div ref='self' class='vue-block' :class="{'selected':model.selected}" :style='style'>
    <header>
      <em class='setting' @click='updateBlock'>
        <icon-setting />
      </em>
      <span>{{ model.title }}</span>
      <em class='delete' @click='deleteBlock'>
        <icon-close />
      </em>
    </header>
    <div class='properties'>
      <div class='inputs'>
        <div class='input' v-for='(slot, index) in model.inputs'>
          <em class='circle inputSlot' :class='{active: slot.active}'
              @mouseup='slotMouseUp($event, index)'
              @mousedown='slotBreak($event, index)'></em>
          <span>{{ slot.label }}</span>
        </div>
      </div>
      <div class='outputs'>
        <div class='output' v-for='(slot, index) in model.outputs'>
          <em class='circle' :class='{active: slot.active}'
              @mousedown='slotMouseDown($event, index)'></em>
          <span>{{ slot.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import IconClose from './icons/IconClose.vue'
import IconSetting from './icons/IconSetting.vue'

const props = defineProps({
  model: { type: Object, required: true },
  options: { type: Object }
})
const emit = defineEmits(['select', 'linkingStart', 'linkingStop', 'linkingBreak', 'update', 'delete', 'updatePosition'])
const self = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)
const lastMouseX = ref(0)
const lastMouseY = ref(0)
const linking = ref(false)
const dragging = ref(false)
const width = ref(0)
const hasDragged = ref(false)
const position = ref({ x: 0, y: 0 })
onMounted(() => {
  width.value = props.options.width
  position.value.x = props.model.x
  position.value.y = props.model.y
  if (document) {
    document.documentElement.addEventListener('mousemove', onMouseMove, true)
    document.documentElement.addEventListener('mousedown', onMouseDown, true)
    document.documentElement.addEventListener('mouseup', onMouseUp, true)
  }
})
onBeforeUnmount(() => {
  if (document) {
    document.documentElement.removeEventListener('mousemove', onMouseMove, true)
    document.documentElement.removeEventListener('mousedown', onMouseDown, true)
    document.documentElement.removeEventListener('mouseup', onMouseUp, true)
  }
})
const onMouseMove = (e) => {
  mouseX.value = e.pageX || e.clientX + document.documentElement.scrollLeft
  mouseY.value = e.pageY || e.clientY + document.documentElement.scrollTop
  if (dragging.value && !linking.value) {
    let diffX = mouseX.value - lastMouseX.value
    let diffY = mouseY.value - lastMouseY.value
    lastMouseX.value = mouseX.value
    lastMouseY.value = mouseY.value
    moveWithDiff(diffX, diffY)
    hasDragged.value = true
  }
}
const onMouseDown = (e) => {
  mouseX.value = e.pageX || e.clientX + document.documentElement.scrollLeft
  mouseY.value = e.pageY || e.clientY + document.documentElement.scrollTop
  lastMouseX.value = mouseX.value
  lastMouseY.value = mouseY.value
  const target = e.target || e.srcElement
  if (self.value.contains(target) && e.which === 1) {
    dragging.value = true
    emit('select')
    if (e.preventDefault) e.preventDefault()
  }
}
const onMouseUp = () => {
  if (dragging.value) {
    dragging.value = false
    if (hasDragged.value) {
      hasDragged.value = false
    }
  }
  if (linking.value) {
    linking.value = false
  }
}
const slotMouseDown = (e, index) => {
  linking.value = true
  emit('linkingStart', index)
  if (e.preventDefault) e.preventDefault()
}
const slotMouseUp = (e, index) => {
  emit('linkingStop', index)
  if (e.preventDefault) e.preventDefault()
}
const slotBreak = (e, index) => {
  linking.value = true
  emit('linkingBreak', index)
  if (e.preventDefault) e.preventDefault()
}
const deleteBlock = () => {
  emit('delete')
}
const updateBlock = () => {
  emit('update')
}
const moveWithDiff = (diffX, diffY) => {
  let left = position.value.x + diffX / props.options.scale
  let top = position.value.y + diffY / props.options.scale
  position.value.x = left
  position.value.y = top
  emit('updatePosition', position.value)
}
const style = computed(() => {
  return {
    top: props.options.center.y + position.value.y * props.options.scale + 'px',
    left: props.options.center.x + position.value.x * props.options.scale + 'px',
    width: width.value + 'px',
    transform: 'scale(' + (props.options.scale + '') + ')',
    transformOrigin: 'top left'
  }
})
</script>

<style lang='less' scoped>
@blockBorder: 1px;
@borderColor: #c4cbd1;
@borderColorSelected: #333333;
@ioPaddingInner: 4px 0;
@ioHeight: 16px;
@ioFontSize: 12px;
@circleBorder: 1px;
@circleSize: 10px;
@circleMargin: 2px; // left/right
@circleNewColor: #52c41a;
@circleRemoveColor: #ff4d4f;
@circleConnectedColor: #faad14;

.vue-block {
  position: absolute;
  box-sizing: border-box;
  border: @blockBorder solid @borderColor;
  background: white;
  z-index: 1;
  opacity: 0.9;
  cursor: move;
  border-radius: 8px;

  &.selected {
    border: @blockBorder solid @borderColorSelected;
    z-index: 2;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;

    > header {
      span {
        color: #333;
      }
    }
  }

  > header {
    text-align: center;
    position: relative;
    display: flex;
    height: 28px;
    align-items: center;
    border-bottom: 1px solid @borderColor;

    > span {
      font-size: 12px;
      flex-grow: 1;
      font-weight: 600;
      color: #666;
      text-align: center;
      margin: 0 4px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    > .delete, > .setting {
      display: inline-block;
      line-height: 1;
      color: @borderColor;
      cursor: pointer;
      flex: 0 0 16px;
      height: 16px;
      margin-right: 4px;

      &:hover {
        color: #333333;
      }
    }

    > .setting {
      margin-right: 0;
      margin-left: 4px;
    }
  }

  .properties {
    display: flex;
    align-items: flex-start;
    padding: 4px 0 8px 0;

    .inputs, .outputs {
      width: 50%;
    }
  }

  .outputs {
    text-align: right;
  }

  .circle {
    box-sizing: border-box;
    width: calc(@circleSize + 1px);
    height: calc(@circleSize + 1px);
    border: @circleBorder solid rgba(0, 0, 0, 0.5);
    border-radius: 100%;
    cursor: crosshair;
    position: absolute;
    top: 5px;
    background: white;

    &.active {
      background: @circleConnectedColor;
    }
  }

  .input, .output {
    line-height: 1;
    padding: @ioPaddingInner;
    font-size: @ioFontSize;
    position: relative;
  }

  .input, .output{
    >span{
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      display: block;
    }
  }

  .input {
    padding-left: calc(4px + @circleSize / 2);
    padding-right: 4px;
    .circle {
      left: -((@circleSize + 2px)/2);

      &:hover {
        background: @circleNewColor;

        &.active {
          background: @circleRemoveColor;
        }
      }
    }
  }

  .output {
    padding-right: calc(4px + @circleSize / 2);
    padding-left: 4px;

    .circle {
      right: -((@circleSize + 2px)/2);

      &:hover {
        background: @circleNewColor;
      }
    }
  }
}
</style>
