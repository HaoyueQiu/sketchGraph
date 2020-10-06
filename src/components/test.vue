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
      initCanvas() {
        this.canvas = new fabric.Canvas('canvas');
        this.canvas.setWidth(1500);
        this.canvas.setHeight(600);
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
