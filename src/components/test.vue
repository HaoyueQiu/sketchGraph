<template>
  <div class="canvas-wraper">
    <canvas id="canvas" ref="canvas"></canvas>
  </div>

</template>
<script>
  import {fabric} from 'fabric'

  export default {
    name: 'Test',
    data() {
      return {
        canvas: null,
      }
    },
    mounted() {
      this.initCanvas();
    },
    methods: {
      initCanvas() {
        this.canvas = new fabric.Canvas('canvas');
        this.canvas.setWidth(1500);
        this.canvas.setHeight(600);
        var obj = {a: "Hello", b: "World"};
        let rect = new fabric.Rect({
          left: 10,
          top: 10,
          width: 300,
          height: 300,
          fill: "rgba(255, 255, 255, 0)",
          stroke: "rgba(0, 255, 255, 1)",
          strokeWidth: 2,
          strokeDashArray:[0,1],
        });
        this.canvas.add(rect);

      },
    },

  }
</script>

<style>
  #my-img {
    /*width: 300px;*/
    /*height: 500px;*/
    width: 0.1px;
    height: 0.1px;
    display: none;
  }

</style>
