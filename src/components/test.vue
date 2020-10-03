<template>
  <div>
    <el-button type="text" @click="drawer = true">打开嵌套表格的 Drawer</el-button>
    <el-drawer
      title="属性"
      :visible.sync="drawer"
      direction="rtl"
      size="30%">
      <div class="attributeBlock">
        <span class="attributeSpan">名称(唯一):</span>
        <el-input type="text" v-model="currentObj.newid" maxlength="20" show-word-limit @blur="changeID()"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">x</span>
        <el-input type="number" v-model="currentObj.left" min="0" :max="canvasWidth"></el-input>
        <span class="attributeSpan">y</span>
        <el-input type="number" v-model="currentObj.top" min="0" :max="canvasWidth"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">width</span>
        <el-input type="number" v-model="currentObj.width" min="0"></el-input>
        <span class="attributeSpan">height</span>
        <el-input type="number" v-model="currentObj.height" min="0"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">角度</span>
       <el-input type="number" v-model="currentObj.angle" min="0"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">画笔粗细</span>
        <el-input type="number" v-model="currentObj.strokeWidth" min="0"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">画笔颜色</span>
        <el-color-picker v-model="currentObj.color" show-alpha :predefine="predefineColors"></el-color-picker>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">填充颜色</span>
        <el-color-picker v-model="currentObj.fill" show-alpha :predefine="predefineColors"></el-color-picker>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">水平翻转</span>
        <el-switch
          v-model="currentObj.flipX"
          active-color="#13ce66"
          inactive-color="#888888">
        </el-switch>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">垂直翻转</span>
        <el-switch
          v-model="currentObj.flipY"
          active-color="#13ce66"
          inactive-color="#888888">
        </el-switch>
      </div>


    </el-drawer>
  </div>

</template>
<script>
  export default {
    data() {
      return {
        drawer: false,
        currentObj: {
          //id、颜色、画笔粗细、填充、位置、大小(宽、高)、是否删除、旋转角度、翻转(flipX flipY)
          id: '00',
          newid: '00',
          color: 'rgba(0, 0, 0, 1)',
          strokeWidth: 0,
          fill: 'rgba(0, 0, 0, 0)',
          left: 0,
          top: 0,
          height: 0,
          width: 0,
          angle: 0,
          flipX: false,
          flipY: false,
          delete: false,
        },
        predefineColors: [],
      };
    },
    computed: {
      canvasWidth() {
        // 硬编码 侧边栏宽度...........
        return window.innerWidth - 300;
      }
    },
    methods: {
      changeID() {
        console.log("change ID");
      }

    }
  }
</script>

<style>
  .attributeBlock {
    display: table;
  }

  .attributeSpan {
    display: table-cell;
    vertical-align: middle;
  }

</style>
