<template>
  <div class="wraper" ref="wraper">
    <el-container>
      <el-header><p>"this is SketchGraph"</p></el-header>
      <el-container>
        <el-aside width="200px">
          <p>"This a control panel"</p>
          <el-button-group>
            <div v-for="(tool,idx) in toolsArr" :key="idx"
                 @click="handleTools(tool.name)">
              <el-button type="primary"> {{tool.name}}</el-button>
            </div>
          </el-button-group>
        </el-aside>
        <el-main>
          <div class="canvas-wraper">
            <canvas id="canvas" ref="canvas"></canvas>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
  import {fabric} from 'fabric'
  export default {
    name: 'SketchGraph',
    data() {
      return {
        currentTool: '',
        fabricCanvas: null,
        toolsArr: [
          {
            name: 'choose'
          },
          {
            name: 'rectangle',
            icon: ' el-icon-delete'
          },
          {
            name: 'circle',
          },
          // {
          //   name: 'line',
          //   icon: ' el-icon-edit'
          // },
          {
            name: 'clear',
          },
          {
            name: 'remove',
          },
          {
            name: 'redo',
          },
          {
            name: 'undo',
          }

        ],
        //记录鼠标的移动
        mouseFrom: {},
        mouseTo: {},
        // moveCount: 1,
        isDrawing: false, //当前是否处于绘制模式
        fabricHistoryJson: [], //记录绘制历史：重做、撤销
        step: 0, // 用于 重做、撤销操作的计步
        drawingObject: null, //绘制对象
        drawColor: '#E34F51',
        drawWidth: 2,


      }
    },
    mounted() {
      //初始化canvas
      this.initCanvas()
    },
    computed: {
      canvasWidth() {
        // 硬编码 侧边栏宽度...........
        return window.innerWidth - 300;
      }
    },
    methods: {
      initCanvas() {
        let _this = this;
        this.fabricCanvas = new fabric.Canvas('canvas', {
          isDrawingMode: false,
          selectable: false,
          selection: false,
          // devicePixelRatio:true, //Retina 高清屏 屏幕支持
        });
        this.fabricCanvas.setWidth(this.canvasWidth);
        this.fabricCanvas.setHeight(500);
        //绑定画板事件，对鼠标的各个操作进行监听
        this.fabricCanvasEvent();
        // 可以通过名称来获取fabricObject
        fabric.Canvas.prototype.getItemByName = function (name) {
          let object = null,
            objects = this.getObjects();
          for (let i = 0, len = this.size(); i < len; i++) {
            if (objects[i].name && objects[i].name === name) {
              object = objects[i];
              break;
            }
          }
          return object;
        };
      },
      //事件监听
      fabricCanvasEvent() {
        this.fabricCanvas.on({
          'mouse:down': (o) => {
            this.mouseFrom.x = o.pointer.x;
            this.mouseFrom.y = o.pointer.y;
            this.isDrawing = true;
            // if (this.currentTool == 'text') {
            //   this.drawText()
            // }
          },
          'mouse:up': (o) => {
            this.mouseTo.x = o.pointer.x;
            this.mouseTo.y = o.pointer.y;
            this.updateModifications();
            this.isDrawing = false;
            this.drawingObject = null;
          },
          'mouse:move': (o) => {
            if (!this.isDrawing) {
              return; // 不处于绘制模式则不进行绘制
            }
            this.mouseTo.x = o.pointer.x;
            this.mouseTo.y = o.pointer.y;
            this.handleTools(this.currentTool);
          },
          //对象移动时间
          'object:moving': (e) => {
            e.target.opacity = 0.5;
          },
          'object:modified': (e) => {
            e.target.opacity = 1;
            let object = e.target;
            this.updateModifications();
          },
          // 'selection:created': (e) => {
          //   if (e.target._objects) {
          //     //多选删除
          //     var etCount = e.target._objects.length;
          //     for (var etindex = 0; etindex < etCount; etindex++) {
          //       this.fabricObj.remove(e.target._objects[etindex]);
          //     }
          //   } else {
          //     //单选删除
          //     this.fabricObj.remove(e.target);
          //   }
          //   this.fabricObj.discardActiveObject(); //清楚选中框
          //   this.updateModifications(true)
          // },
        });
      },
      // transformMouse(mouseX, mouseY) {
      //   return {x: mouseX / this.zoom, y: mouseY / this.zoom};
      // },
      resetCanvas() {
        this.fabricCanvas.selectable = false;
        this.fabricCanvas.selection = false;
        this.fabricCanvas.skipTargetFind = true;
        this.mouseFrom = {};
        this.mouseTo = {};
        this.drawingObject = null;
        this.isDrawing = false;
        //清除文字对象
        // if (this.textboxObj) {
        //   this.textboxObj.exitEditing();
        //   this.textboxObj = null;
        // }
      },
      handleTools(tool) {
        this.currentTool = tool;
        //isDrawingMode为True就能用鼠标随机画线条
        this.fabricCanvas.isDrawingMode = false;
        if (this.drawingObject) {
          this.fabricCanvas.remove(this.drawingObject)
        }
        let drawingObject = null;
        switch (tool) {
          case 'remove':
            console.log('remove');
            this.fabricCanvas.selection = true;
            // skipTargetFind为true时：选中的会被设置为null，即无法被选中
            this.fabricCanvas.skipTargetFind = false;
            this.fabricCanvas.selectable = true;
            break;
          case 'clear':
            this.fabricCanvas.clear();
            this.resetCanvas();
            break;
          case 'rectangle':
            drawingObject = this.drawRectangle();
            break;
          case 'circle':
            drawingObject = this.drawCircle();
            break;
          case 'redo':
            this.redo();
            break;
          case 'undo':
            this.undo();
            break;
          default:
            break;
        }
        if (drawingObject && this.isDrawing) {
          this.fabricCanvas.add(drawingObject);
          this.drawingObject = drawingObject;
        }
      },
      // 储存操作记录
      updateModifications() {
        // 每次都记录一整个画布状态，比较耗存储。
        // 后续改造：可以考虑记录变化的操作
        this.fabricHistoryJson.push(JSON.stringify(this.fabricCanvas));
      },
      //撤销操作
      undo() {
        let state = this.fabricHistoryJson;
        if (this.step < state.length) {
          this.fabricCanvas.clear();
          this.fabricCanvas.loadFromJSON(state[state.length - 1 - this.step - 1]);
          this.fabricCanvas.renderAll();
          this.step += 1;
        }
      },
      //重做操作
      redo() {
        let state = this.fabricHistoryJson;
        if (this.step > 0) {
          this.fabricCanvas.clear().renderAll();
          this.fabricCanvas.loadFromJSON(state[state.length - 1 - this.step + 1]);
          this.fabricCanvas.renderAll();
          this.step -= 1;
        }
      },
      drawRectangle() {
        let width = this.mouseTo.x - this.mouseFrom.x;
        let height = this.mouseTo.y - this.mouseFrom.y;
        let drawingObject = new fabric.Rect({
          top: this.mouseFrom.y, left: this.mouseFrom.x,
          width: width, height: height,
          fill: "rgba(255, 255, 255, 0)",
          stroke: this.drawColor,
          strokeWidth: this.drawWidth,
        });
        return drawingObject;
      }
      ,
      drawCircle() {
        let radius = Math.sqrt((this.mouseTo.x - this.mouseFrom.x) * (this.mouseTo.x - this.mouseFrom.x) + (this.mouseTo.y - this.mouseFrom.y) * (this.mouseTo.y - this.mouseFrom.y)) / 2;
        let fabricObject = new fabric.Circle({
          left: this.mouseFrom.x,
          top: this.mouseFrom.y,
          stroke: this.drawColor,
          fill: "rgba(255, 255, 255, 0)",
          radius: radius,
          strokeWidth: this.drawWidth
        });
        return fabricObject;
      },
      //绘制文字对象
      // drawText() {
      //   this.textboxObj = new fabric.Textbox(" ", {
      //     left: this.mouseFrom.x,
      //     top: this.mouseFrom.y,
      //     width: 220,
      //     fontSize: 18,
      //     fill: this.drawColor,
      //     hasControls: true
      //   });
      //   this.fabricObj.add(this.textboxObj);
      //   this.textboxObj.enterEditing();
      //   this.textboxObj.hiddenTextarea.focus();
      //   this.updateModifications(true)
      // },
    },
  }
</script>

<style>
  .el-main {
    background-color: #E9EEF3;
    top: 0px;
  }

  .el-aside {
    background-color: #D3DCE6;
  }

  .el-header, .el-footer {
    background-color: #B3C0D1;
  }
</style>
