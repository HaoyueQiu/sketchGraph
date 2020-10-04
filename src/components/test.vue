<template>
  <div class="canvas-wraper">
    <canvas id="canvas" ref="canvas"></canvas>
  </div>

</template>
<script>
  import {fabric} from 'fabric'

  export default {
    name:'Test',
    mounted() {
      this.initCanvas();
    },
    methods: {
      initCanvas() {
        var canvas = new fabric.Canvas('canvas');
        // create a rectangle object
        var rect = new fabric.Rect({
          left: 100,
          top: 100,
          fill: 'red',
          width: 20,
          height: 20
        });
        console.log("test!")
        canvas.add(rect);
        canvas.setWidth(2000);
        canvas.setHeight(500);
        // rect.set({'left':400})
        rect.set({stroke:'blue'});
      }
    }
  }
</script>

<style>


</style>
