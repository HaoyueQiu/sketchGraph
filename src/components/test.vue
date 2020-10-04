<template>
  <div class="canvas-wraper">
    <canvas id="canvas" ref="canvas"></canvas>
  </div>

</template>
<script>
  import {fabric} from 'fabric'

  export default {
    name: 'Test',
    mounted() {
      this.initCanvas();
    },
    methods: {
      initCanvas() {
        var canvas = new fabric.Canvas('canvas');
        // create a rectangle object
        var rect = new fabric.Rect({
          strokeDashArray:[10,2],
          left: 100,
          top: 100,
          fill: 'red',
          width: 20,
          height: 20
        });
        console.log("test!");
        canvas.setWidth(1500);
        canvas.setHeight(600);
        // new fabric.Line
        // let doshedLine = new fabric.Line([20, 30, 300, 200,], {
        //   strokeDashArray: [100, 0],
        //   stroke: '#000000',
        //   strokeWidth: 3,
        // });
        // doshedLine.set({height:800,width:1000})
        // console.log(doshedLine.get('strokeDashArray'))
        // console.log(doshedLine.get('points'));
        // canvas.add(doshedLine);
        // canvas.add(rect);
        // rect.set({'left':400})
        // rect.set({stroke: 'blue'});


        let fabricObj = new fabric.Textbox("hi", {
          left: 30,
          top: 30,
          fontSize: 14,
          fill: '#000000',
          hasControls: true
        });
        canvas.add(fabricObj);
        let text = fabricObj.get('text');
        console.log(text);
        fabricObj.enterEditing();
        fabricObj.exitEditing();
        // fabricObj.hiddenTextarea.focus();
        // this.textboxObj.hiddenTextarea.focus();
        // this.updateModifications(true)
      }
    }
  }
</script>

<style>


</style>
