<template>
  <div>
    <div class="block">
      <span>画笔粗细 <el-slider v-model="drawWidth" :min=1></el-slider></span>

    </div>
  </div>

</template>

<script>
  export default {
    name: 'Test2',
    data() {
      return {
        drawWidth: 10
      };
    },
    mounted() {
    },
    methods: {
      handleCommand(command) {
        this.$message('click on item ' + command);
      }

    }
  };
</script>
