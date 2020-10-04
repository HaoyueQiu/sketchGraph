<template>
  <div class="wraper" ref="wraper">
    <el-container>
      <el-header><p>"this is SketchGraph"</p></el-header>
      <el-container>
        <el-aside width="300px">
          <p>This a control panel</p>
          <el-color-picker v-model="drawColor" show-alpha :predefine="predefineColors"
                           @change="addPredefineColor(drawColor)"></el-color-picker>

          <div class="block">
            <span>画笔粗细</span>
            <el-slider v-model="drawWidth" :min=1></el-slider>
          </div>

          <div class="block">
            <span>虚线设置：实线</span>
            <el-slider v-model="dashArray[0]" :min=1></el-slider>
            <span>虚线设置：空白</span>
            <el-slider v-model="dashArray[1]" :min=0></el-slider>
          </div>

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


    <el-drawer title="属性" :visible.sync="attributeDrawer" direction="rtl" size="30%">
      <div class="attributeBlock">
        <span class="attributeSpan">名称(唯一):</span>
        <el-input type="text" v-model="currentObj.newid" maxlength="20" show-word-limit @blur="changeID()"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">x</span>
        <el-input type="number" v-model="currentObj.left" min="0" :max="canvasWidth"
                  @blur="changeAttribute('left')"></el-input>
        <span class="attributeSpan">y</span>
        <el-input type="number" v-model="currentObj.top" min="0" :max="canvasWidth"
                  @blur="changeAttribute('top')"></el-input>
      </div>

      <div v-if="currentObj.type=='rect' || currentObj.type=='line'" class="attributeBlock">
        <span class="attributeSpan">width</span>
        <el-input type="number" v-model="currentObj.width" min="0" @blur="changeAttribute('width')"></el-input>
        <span class="attributeSpan">height</span>
        <el-input type="number" v-model="currentObj.height" min="0" @blur="changeAttribute('height')"></el-input>
      </div>
      <div v-else-if="currentObj.type=='circle'" class="attributeBlock">
        <span class="attributeSpan">radius</span>
        <el-input type="number" v-model="currentObj.radius" min="0" @blur="changeAttribute('radius')"></el-input>
      </div>
      <div v-else-if="currentObj.type=='ellipse'" class="attributeBlock">
        <span class="attributeSpan">rx</span>
        <el-input type="number" v-model="currentObj.rx" min="0" @blur="changeAttribute('rx')"></el-input>
        <span class="attributeSpan">ry</span>
        <el-input type="number" v-model="currentObj.ry" min="0" @blur="changeAttribute('ry')"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">角度</span>
        <el-input type="number" v-model="currentObj.angle" min="0" @blur="changeAttribute('angle')"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">画笔粗细</span>
        <el-input type="number" v-model="currentObj.strokeWidth" min="0"
                  @blur="changeAttribute('strokeWidth')"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">画笔颜色</span>
        <el-color-picker v-model="currentObj.strokeColor" show-alpha :predefine="predefineColors"
                         @change="changeAttribute('strokeColor')"></el-color-picker>
      </div>

      <div v-if="currentObj.type!='line'" class="attributeBlock">
        <span class="attributeSpan">填充颜色</span>
        <el-color-picker v-model="currentObj.fillColor" show-alpha :predefine="predefineColors"
                         @change="changeAttribute('fillColor')"></el-color-picker>
      </div>


      <div class="attributeBlock">
        <span class="attributeSpan">水平翻转</span>
        <el-switch v-model="currentObj.flipX" active-color="#13ce66" inactive-color="#888888"
                   @change="changeAttribute('flipX')"></el-switch>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">垂直翻转</span>
        <el-switch v-model="currentObj.flipY" active-color="#13ce66" inactive-color="#888888"
                   @change="changeAttribute('flipY')"></el-switch>
      </div>
    </el-drawer>
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
            name: 'choose',
          },
          {
            name: 'draw',
          },
          {
            name: 'rectangle',
            icon: ' el-icon-delete'
          },
          {
            name: 'line',
          },
          {
            name: 'circle',
          },
          {
            name: 'ellipse',
          },
          {
            name: 'text'
          },

          {
            name: 'fill',
          },
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
        mouseFrom: {}, //记录鼠标的移动
        mouseTo: {},
        isDrawing: false, //当前是否处于绘制模式
        fabricHistoryJson: [], //记录绘制历史：重做、撤销
        step: 0, // 用于 重做、撤销操作的计步
        drawingObject: null, //绘制对象
        drawWidth: 2,
        drawColor: 'rgba(0, 0, 0, 1)',
        predefineColors: [],
        predefineColorsNum: 30,//预定义颜色的最大上限
        isObjClicked: false, //判断是否单击并且没有移动物体
        idNum: 0,//全局idNum，用于自动创建名称
        attributeDrawer: false,
        dashArray: [1, 0],
        currentObj: {
          obj: '',
          type: '',
          //id、颜色、画笔粗细、填充、位置、大小(宽、高)、是否删除、旋转角度、翻转(flipX flipY)
          id: '00',
          newid: '00',
          strokeColor: 'rgba(0, 0, 0, 1)',
          strokeWidth: 0,
          fillColor: 'rgba(0, 0, 0, 0)',
          left: 0,
          top: 0,
          height: 0,
          width: 0,
          radius: 0,
          rx: 0,
          ry: 0,
          angle: 0,
          flipX: false,
          flipY: false,
          delete: false,
        },
        textSetting: {
          fontSize: 14,
          fontWeight: 'normal',
          underline: false,
          overline: false,
          linethrough: false,
        },
        lastTextObj:null,

      }
    },
    mounted() {
      //初始化canvas
      this.initCanvas()
    },
    computed: {
      canvasWidth() {
        // 硬编码 侧边栏宽度...........
        return window.innerWidth - 300 - 30;
      }
    },
    methods: {
      initCanvas() {
        let _this = this;
        this.fabricCanvas = new fabric.Canvas('canvas', {
          isDrawingMode: false,
          // 表明是否可以group selection，default = true
          selection: false,
          // devicePixelRatio:true, //Retina 高清屏 屏幕支持？？？？？？
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
            if (o.target) {
              this.isObjClicked = true;
            }
            switch (this.currentTool) {
              case "remove":
                //一次删除一个物体
                this.fabricCanvas.remove(o.target);
                break;
              case 'fill':
                if (o.target) {
                  o.target.set({fill: this.drawColor});
                }
                break;
              case 'text':
                this.lastTextObj = this.drawText();
                while (!this.isIDUnique('text' + this.idNum++)) {
                  this.idNum++;
                }
                this.lastTextObj.set({'name': 'text' + this.idNum});
                this.idNum++;
                this.fabricCanvas.add(this.lastTextObj);
                this.lastTextObj.enterEditing();
                this.setAllObjSelectable(false);
                break;
              //退出编辑模式
            }
          },
          'mouse:up': (o) => {
            this.mouseTo.x = o.pointer.x;
            this.mouseTo.y = o.pointer.y;
            this.updateModifications();
            this.isDrawing = false;
            this.drawingObject = null;
            // 单击物体展开属性板
            if (this.isObjClicked && o.target && this.currentTool == 'choose') {
              console.log("an object is selected and not move!");
              this.attributeDrawer = true;
              // 将物体属性的值给currentObject
              this.currentObjAttribute(o.target);
              this.isObjClicked = false;
            }
          },
          'mouse:move': (o) => {
            if (!this.isDrawing) {
              return; // 不处于绘制模式则不进行绘制
            }
            this.mouseTo.x = o.pointer.x;
            this.mouseTo.y = o.pointer.y;
            this.handleTools(this.currentTool);
          },
          //对象移动期间，设置透明度
          'object:moving': (e) => {
            e.target.opacity = 0.5;
          },
          'object:modified': (e) => {
            e.target.opacity = 1;
            this.isObjClicked = false;
          },
        });
      },
      // transformMouse(mouseX, mouseY) {
      //   return {x: mouseX / this.zoom, y: mouseY / this.zoom};
      // },
      resetCanvas() {
        this.fabricCanvas.clear();
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
        if (this.drawingObject) {
          this.fabricCanvas.remove(this.drawingObject)
        }
        this.setAllObjSelectable(false);
        if(this.lastTextObj){
          this.lastTextObj.exitEditing();
        }
        let drawingObject = null;
        let name = '';
        switch (tool) {
          case 'clear':
            this.resetCanvas();
            break;
          case 'rectangle':
            drawingObject = this.drawRectangle();
            name = 'rectangle';
            break;
          case 'line':
            drawingObject = this.drawLine();
            name = 'line';
            break;
          case 'circle':
            drawingObject = this.drawCircle();
            name = 'circle';
            break;
          case 'ellipse':
            drawingObject = this.drawEllipse();
            name = 'ellipse';
            break;
          case 'redo':
            this.redo();
            break;
          case 'undo':
            this.undo();
            break;
          case 'remove':
            this.setAllObjSelectable(true);
            break;
          case 'choose':
            this.setAllObjSelectable(true);
            break;
          default:
            break;
        }
        if (drawingObject && this.isDrawing) {
          while (!this.isIDUnique(name + this.idNum++)) {
            this.idNum++;
          }
          drawingObject.set({'name': name + this.idNum});
          this.idNum++;
          this.fabricCanvas.add(drawingObject);
          this.drawingObject = drawingObject;
          this.setAllObjSelectable(false);
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
          strokeDashArray: this.dashArray,
        });
        return drawingObject;
      },

      drawLine() {
        let drawingObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
          stroke: this.drawColor,
          strokeWidth: this.drawWidth,
          strokeDashArray: this.dashArray,
        });
        return drawingObject;
      },
      drawCircle() {
        let moveX = this.mouseTo.x - this.mouseFrom.x;
        let moveY = this.mouseTo.y - this.mouseFrom.y;
        let radius = Math.sqrt((moveX) * (moveX) + (moveY) * (moveY));
        let top = this.mouseFrom.y - radius;
        let left = this.mouseFrom.x - radius;
        let fabricObject = new fabric.Circle({
          left: left,
          top: top,
          stroke: this.drawColor,
          fill: "rgba(255, 255, 255, 0)",
          radius: radius,
          strokeWidth: this.drawWidth,
          strokeDashArray: this.dashArray,
        });
        return fabricObject;
      },
      drawEllipse() {
        let left = this.mouseFrom.x;
        let top = this.mouseFrom.y;
        let fabricObject = new fabric.Ellipse({
          left: left,
          top: top,
          stroke: this.drawColor,
          fill: "rgba(255, 255, 255, 0)",
          originX: "center",
          originY: "center",
          rx: Math.abs(left - this.mouseTo.x),
          ry: Math.abs(top - this.mouseTo.y),
          strokeWidth: this.drawWidth,
          strokeDashArray: this.dashArray,
        });
        return fabricObject;
      },
      // 绘制文字对象
      drawText() {
        let fabricObj = new fabric.Textbox("", {
          left: this.mouseFrom.x,
          top: this.mouseFrom.y,
          fill: this.drawColor,
          fontSize: this.textSetting.fontSize,
          fontWeight:this.textSetting.fontWeight,
          overline:this.textSetting.overline,
          underline:this.textSetting.underline,
          linethrough:this.textSetting.linethrough,
          hasControls: true,
        });
        return fabricObj;
      },
      setAllObjSelectable(isSelectable) {
        this.fabricCanvas.forEachObject(function (obj) {
          obj.selectable = isSelectable;
        });
      },

      addPredefineColor(color) {
        let len = this.predefineColors.length;
        //检查该颜色是否已经存在了，存在的话则不进行添加
        for (let i = 0; i < len; ++i) {
          if (color == this.predefineColors[i]) {
            return;
          }
        }
        if (len >= this.predefineColorsNum) {
          this.predefineColors.shift();
        }
        this.predefineColors.push(color);
      },

      currentObjAttribute(fabricObj) {
        this.currentObj.obj = fabricObj;
        this.currentObj.type = fabricObj.get('type');
        this.currentObj.id = fabricObj.get('name');
        this.currentObj.newid = fabricObj.get('name');
        this.currentObj.left = fabricObj.get('left');
        this.currentObj.top = fabricObj.get('top');
        this.currentObj.angle = fabricObj.get('angle');
        this.currentObj.height = fabricObj.get('height');
        this.currentObj.width = fabricObj.get('width');
        this.currentObj.radius = fabricObj.get('radius');
        this.currentObj.rx = fabricObj.get('rx');
        this.currentObj.ry = fabricObj.get('ry');
        this.currentObj.flipX = fabricObj.get('flipX');
        this.currentObj.flipY = fabricObj.get('flipY');
        this.currentObj.strokeColor = fabricObj.get('stroke');
        this.currentObj.strokeWidth = fabricObj.get('strokeWidth');
        this.currentObj.fillColor = fabricObj.get('fill');
      },

      changeID() {
        console.log("change ID");
        if (!this.isIDUnique(this.currentObj.newid) && this.currentObj.id != this.currentObj.newid) {
          this.ErrorMessage("跟现有物体的id重复，请重新设置");
          this.currentObj.newid = this.currentObj.id;
          return;
        }
        this.currentObj.obj.set({'name': this.currentObj.newid});
      },

      changeAttribute(attr) {
        switch (attr) {
          case 'left':
            this.currentObj.obj.set({left: Number(this.currentObj.left)});
            break;
          case 'top':
            this.currentObj.obj.set({top: Number(this.currentObj.top)});
            break;
          case 'width':
            this.currentObj.obj.set({width: Number(this.currentObj.width)});
            break;
          case 'height':
            this.currentObj.obj.set({height: Number(this.currentObj.height)});
            break;
          case 'angle':
            this.currentObj.obj.set({angle: Number(this.currentObj.angle)});
            break;
          case 'strokeWidth':
            this.currentObj.obj.set({strokeWidth: Number(this.currentObj.strokeWidth)});
            break;
          case 'strokeColor':
            console.log(this.currentObj.strokeColor)
            this.currentObj.obj.set({stroke: this.currentObj.strokeColor});
            break;
          case 'fillColor':
            this.currentObj.obj.set({fill: this.currentObj.fillColor});
            break;
          case 'flipX':
            console.log(this.currentObj.flipX);
            this.currentObj.obj.set({flipX: this.currentObj.flipX});
            console.log(this.currentObj.flipX);
            break;
          case 'flipY':
            this.currentObj.obj.set({flipY: this.currentObj.flipY});
            break;
          case 'radius':
            this.currentObj.obj.set({radius: this.currentObj.radius});
            break;
          case 'rx':
            this.currentObj.obj.set({rx: this.currentObj.rx});
            break;
          case 'ry':
            this.currentObj.obj.set({ry: this.currentObj.ry});
            break;
          default:
            break;
        }
        this.fabricCanvas.renderAll();
      },

      isIDUnique(id) {
        let objects = this.fabricCanvas.getObjects();
        let len = objects.length;
        for (let i = 0; i < len; ++i) {
          if (objects[i].get('name') == id) {
            return false;
          }
        }
        return true;
      },
      ErrorMessage(message) {
        this.$message.error(message);
      }
    },
  }
</script>

<style>
  .el-main {
    /*background-color: #E9EEF3;*/
    background-color: #ffffff;
    padding: 0px;
    margin: 0px;
  }

  .el-aside {
    background-color: #D3DCE6;
  }

  .el-header, .el-footer {
    background-color: #B3C0D1;
  }

  .attributeBlock {
    display: table;
  }

  .attributeSpan {
    display: table-cell;
    vertical-align: middle;
  }

</style>
