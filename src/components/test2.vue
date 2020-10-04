<template>
  <div>
    <el-button @click="drawer = true" type="primary" style="margin-left: 16px;">
      点我打开
    </el-button>

      <el-drawer
        title="我是标题"
        :visible.sync="drawer"
        :with-header="false">
        <div v-if="isRight==true">
          <span>hhhh</span>
        </div>
        <div v-else>
          <span>hhsahdjahd</span>
        </div>
      </el-drawer>


  </div>

</template>

<script>
  export default {
    name: 'Test2',
    data() {
      return {
        drawer: false,
        isRight: true,
        Obj:{
          x:0,
          y:1,
        }
      };
    },
    mounted(){
    },
    methods: {}
  };
</script>
