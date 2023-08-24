<script setup lang="ts">
import VueBlocksContainer from '../components/VueBlocksContainer.vue'
import {reactive} from "vue";

const data = reactive({
  blocks: [
    {
      name: 'test',
      title: 'Test block',
      family: 'Test',
      description: 'Description text',
      fields: [
        {
          name: 'in1',
          type: 'event',
          attr: 'input'
        },
        {
          name: 'in2',
          type: 'event',
          attr: 'input'
        },
        {
          name: 'out1',
          type: 'event',
          attr: 'output'
        },
        {
          name: 'out2',
          type: 'event',
          attr: 'output'
        }
      ]
    }
  ],
  scene: {
    blocks: [
      {
        id: 1,
        x: 0,
        y: 0,
        name: 'test',
        title: 'Test block',
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
        id: 2,
        x: 0,
        y: 150,
        name: 'test',
        title: 'Test block 2',
        values: {
          property: [
            {
              name: 'message',
              type: 'string'
            }
          ]
        }
      }
    ],
    links: [],
    container: {
      centerX: 0,
      centerY: 0,
      scale: 1
    }
  }
})

</script>

<template>
  <div style="width: 100%; height: 100vh">
    <VueBlocksContainer
        ref="container"
        :blocksContent="data.blocks"
        :scene.sync="data.scene"
        class="container"/>
  </div>
</template>
