<template>
  <div>
    <el-table
      :data="commandHistory"
      height="500"
      border
      style="width:300px">
      <el-table-column
        prop="command"
        label="Command History">
      </el-table-column>
    </el-table>
  </div>

</template>

<script>
  export default {
    name: 'Test2',
    data() {
      return {
        drawWidth: 10,
        commandHistory: [{
          command: '上海市普陀区金沙江路 1518 弄'
        }, {
          command: '上海市普陀区金沙江路 1518 弄'
        }, {
          command: '上海市普陀区金沙江路 1518 弄'
        }, {
          command: '上海市普陀区金沙江路 1518 弄'
        }]
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
