<template>
  <div ref="self" class="vue-block" :class="{selected: selected}" :style="style">
    <header :style="headerStyle">
      {{ model.title }}
      <a class="delete" @click="deleteBlock">x</a>
    </header>
    <div class="inputs">
      <div class="input" v-for="(slot, index) in model.inputs">
        <div class="circle inputSlot" :class="{active: slot.active}"
             @mouseup="slotMouseUp($event, index)"
             @mousedown="slotBreak($event, index)"></div>
        {{ slot.label }}
      </div>
    </div>
    <div class="outputs">
      <div class="output" v-for="(slot, index) in model.outputs">
        <div class="circle" :class="{active: slot.active}"
             @mousedown="slotMouseDown($event, index)"></div>
        {{ slot.label }}
      </div>
    </div>
  </div>
</template>
<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps({
  model: {type: Object, required: true},
  selected: {type: Boolean, default: false},
  options: {type: Object}
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
const position = ref({x: 0, y: 0})
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
      save()
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
const save = () => {
  emit('update')
}
const deleteBlock = () => {
  emit('delete')
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
const headerStyle = computed(() => {
  return {
    height: props.options.titleHeight + 'px'
  }
})
</script>

<style lang="less" scoped>
@blockBorder: 1px;
@ioPaddingInner: 2px 0;
@ioHeight: 16px;
@ioFontSize: 14px;
@circleBorder: 1px;
@circleSize: 10px;
@circleMargin: 2px; // left/right
@circleNewColor: #00FF00;
@circleRemoveColor: #FF0000;
@circleConnectedColor: #FFFF00;

.vue-block {
  position: absolute;
  box-sizing: border-box;
  border: @blockBorder solid black;
  background: white;
  z-index: 1;
  opacity: 0.9;
  cursor: move;

  &.selected {
    border: @blockBorder solid red;
    z-index: 2;
  }

  > header {
    background: #bfbfbf;
    text-align: center;

    > .delete {
      color: red;
      cursor: pointer;
      float: right;
      position: absolute;
      right: 5px;
    }
  }

  .inputs, .outputs {
    padding: @ioPaddingInner;
    display: block;
    width: 50%;

    > * {
      width: 100%;
    }
  }

  .circle {
    box-sizing: border-box;
    margin-top: @ioHeight / 2 - @circleSize / 2;
    width: @circleSize;
    height: @circleSize;
    border: @circleBorder solid rgba(0, 0, 0, 0.5);
    border-radius: 100%;
    cursor: crosshair;

    &.active {
      background: @circleConnectedColor;
    }
  }

  .inputs {
    float: left;
    text-align: left;
    margin-left: -(@circleSize/2 + @blockBorder);
  }

  .input, .output {
    height: @ioHeight;
    overflow: hidden;
    font-size: @ioFontSize;

    &:last-child {
    }
  }

  .input {
    float: left;

    .circle {
      float: left;
      margin-right: @circleMargin;

      &:hover {
        background: @circleNewColor;

        &.active {
          background: @circleRemoveColor;
        }
      }
    }
  }

  .outputs {
    float: right;
    text-align: right;
    margin-right: -(@circleSize/2 + @blockBorder);
  }

  .output {
    float: right;

    .circle {
      float: right;
      margin-left: @circleMargin;

      &:hover {
        background: @circleNewColor;
      }
    }
  }
}
</style>
