<template>
  <div class="canvas-wraper">
    <canvas id="canvas" ref="canvas"></canvas>
    <el-upload
      drag
      action=""
      multiple
      :show-file-list="false"
      :file-list="fileList"
      :on-change="getLocalImgSrc"
      :on-error="addImg">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
  </div>

</template>
<script>
  import {fabric} from 'fabric'

  export default {
    name: 'Test',
    data() {
      return {
        imgSrc: '',
        fileList: [],
        canvas: null,
        A:{
          A:4,
          B:3,
          C:5,
        }
      }
    },
    mounted() {
      this.initCanvas();
    },
    methods: {
      addImg() {
        let canvas = this.canvas;
        fabric.Image.fromURL(this.imgSrc, function (oImg) {
          canvas.add(oImg);
        });
      },
      getLocalImgSrc(event) {
        let reader = new FileReader();
        reader.readAsDataURL(event.raw);
        // 转换成功后的操作，reader.result即为转换后的DataURL ，
        reader.onload = () => {
          this.imgSrc = reader.result;
        }
      },
      saveText(text, filename) {
        var a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        a.setAttribute('download', filename);
        a.click()
      },
      initCanvas() {
        this.canvas = new fabric.Canvas('canvas');
        this.canvas.setWidth(1500);
        this.canvas.setHeight(600);
        var obj = {a: "Hello", b: "World"};
        let rect = new fabric.Rect({
          left:10,
          top:10,
          width:300,
          height:300,
        });

        this.canvas.add(rect);
        let x = 'width';
        let y = {};
        y[x] = Number('40');
        rect.set(y);
        console.log(y);
        // rect.setCoords();
        // this.saveText(JSON.stringify(obj), "filename.json");
        // for(let key in this.A){
        //   this.A[key] = 10;
        // }
        // console.log(this.A.A);

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
