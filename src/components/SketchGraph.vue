<template>
  <div class="wraper" ref="wraper">
    <el-container>
      <el-header>
        <div class="sketchGraphHeader">SketchGraph
          <el-button type="text" @click="centerDialogVisible = true" icon="el-icon-question"></el-button>

        </div>
      </el-header>
      <el-container>
        <el-aside width="300px">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="命令行" name="commandLine">
              <el-table
                :data="commandHistory"
                height="550"
                border
                style="width:300px">

                <el-table-column
                  prop="command"
                  label="Command History">
                </el-table-column>

              </el-table>

              <el-input v-model="cmd" @change="commandLine(cmd)"></el-input>
            </el-tab-pane>

            <el-tab-pane label="工具栏" name="controlPanel">
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

              <el-row class="toolsButton">
                <el-button type="primary" @click="handleTools('choose')">选择</el-button>
                <el-button type="primary" @click="handleTools('fill')">填充</el-button>
              </el-row>

              <el-row class="toolsButton">
                <el-button style="background-color:#21ABCD;" @click="handleTools('remove')">删除</el-button>
                <el-button style="background-color:#21ABCD;" @click="handleTools('clear')">清空</el-button>
              </el-row>

              <el-row class="toolsButton">
                <el-button style="background-color:#89CFF0;" @click="handleTools('redo')">重做</el-button>
                <el-button style="background-color:#89CFF0;" @click="handleTools('undo')">撤销</el-button>
              </el-row>

              <el-row class="toolsButton">
                <el-button style="background-color:#66908A;" @click="handleTools('text')">文本</el-button>
                <el-button style="background-color:#4682BF;" @click="handleTools('pencil')">铅笔</el-button>

              </el-row>

              <el-row class="toolsButton">
                <el-button style="background-color:#425D8A;" @click="handleTools('line')">线段</el-button>
                <el-button style="background-color:#425D8A;" @click="handleTools('rectangle')">矩形</el-button>
              </el-row>

              <el-row class="toolsButton">
                <el-button style="background-color:#425D8A;" @click="handleTools('circle')">圆形</el-button>
                <el-button style="background-color:#425D8A;" @click="handleTools('ellipse')">椭圆</el-button>
              </el-row>

              <el-dropdown trigger="click" @command="handleSave" class="toolsButton">
                <el-button style="background-color:#333399;">
                  保存<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="save2JSON">JSON文件</el-dropdown-item>
                  <el-dropdown-item command="save2JPG">JPG格式</el-dropdown-item>
                  <el-dropdown-item command="save2PNG">PNG格式</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>

              <el-upload drag action="" :show-file-list="false"
                         :on-change="getLocalImgSrc"
                         :on-error="addImg"
                         :before-upload="judgeType">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
              </el-upload>
            </el-tab-pane>

            <el-tab-pane label="文本设置" name="fontSettings">
              <div class="block">
                <span>字体大小</span>
                <el-slider v-model="textSetting.fontSize" :min=1></el-slider>
              </div>

              <div class="block">
                <span>加粗</span>
                <el-radio v-model="textSetting.fontWeight" label="normal">正常</el-radio>
                <el-radio v-model="textSetting.fontWeight" label="bold">加粗</el-radio>
              </div>

              <div class="block">
                <span>下划线</span>
                <el-switch v-model="textSetting.underline" active-color="#13ce66" inactive-color="#888888"></el-switch>
              </div>

              <div class="block">
                <span>上划线</span>
                <el-switch v-model="textSetting.overline" active-color="#13ce66" inactive-color="#888888"></el-switch>
              </div>

              <div class="block">
                <span>删除线</span>
                <el-switch v-model="textSetting.linethrough" active-color="#13ce66"
                           inactive-color="#888888"></el-switch>
              </div>

            </el-tab-pane>

          </el-tabs>
        </el-aside>

        <el-main>
          <div class="canvas-wraper">
            <canvas id="canvas" ref="canvas"></canvas>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <el-drawer title="属性" :visible.sync="attributeDrawer" direction="rtl" size="350px">
      <div class="attributeBlock">
        <span class="attributeSpan">名称(唯一)</span>
        <div>
          <el-input type="text" v-model="currentObj.newid" maxlength="20" show-word-limit @blur="changeID()"></el-input>
        </div>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">x</span>
        <el-input  type="number" v-model="currentObj.left" min="0" :max="canvasWidth"
                  @blur="changeAttribute('left')"></el-input>
      </div>
      <div class="attributeBlock">
        <span class="attributeSpan">y</span>
        <el-input type="number" v-model="currentObj.top" min="0" :max="canvasWidth"
                  @blur="changeAttribute('top')"></el-input>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">角度</span>
        <el-input type="number" v-model="currentObj.angle" min="0" @blur="changeAttribute('angle')"></el-input>
      </div>

      <div v-if="currentObj.type!='textbox' && currentObj.type!='image'">
        <div v-if="currentObj.type=='rect' || currentObj.type=='line'" class="attributeBlock">
          <span class="attributeSpan">width</span>
          <el-input type="number" v-model="currentObj.width" min="0" @blur="changeAttribute('width')"></el-input>
        </div>

        <div v-if="currentObj.type=='rect' || currentObj.type=='line'" class="attributeBlock">
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
          <span class="attributeSpan">画笔粗细</span>
          <el-input type="number" v-model="currentObj.strokeWidth" min="0"
                    @blur="changeAttribute('strokeWidth')"></el-input>
        </div>

        <div class="attributeBlock">
          <span class="attributeSpan">画笔颜色</span>
          <el-color-picker v-model="currentObj.stroke" show-alpha :predefine="predefineColors"
                           @change="changeAttribute('stroke')"></el-color-picker>
        </div>

        <div v-if="currentObj.type!='line'" class="attributeBlock">
          <span class="attributeSpan">填充颜色</span>
          <el-color-picker v-model="currentObj.fill" show-alpha :predefine="predefineColors"
                           @change="changeAttribute('fill')"></el-color-picker>
        </div>


      </div>
      <!--文本属性面板-->
      <div v-if="currentObj.type=='text'">
        <div class="attributeBlock">
          <span class="attributeSpan">文本内容</span>
          <el-input type="textarea" autosize v-model="currentObj.text" @blur="changeAttribute('text')"></el-input>
        </div>


        <div class="block">
          <span>字体大小</span>
          <el-slider v-model="currentObj.fontSize" :min=1 @change="changeAttribute('fontSize')"></el-slider>
        </div>

        <div class="block">
          <span>加粗</span>
          <el-radio v-model="currentObj.fontWeight" label="normal" @change="changeAttribute('fontWeight')">正常</el-radio>
          <el-radio v-model="currentObj.fontWeight" label="bold" @change="changeAttribute('fontWeight')">加粗</el-radio>
        </div>

        <div class="block">
          <span>下划线</span>
          <el-switch v-model="currentObj.underline" active-color="#13ce66"
                     inactive-color="#888888" @change="changeAttribute('underline')"></el-switch>
        </div>

        <div class="block">
          <span>上划线</span>
          <el-switch v-model="currentObj.overline" active-color="#13ce66"
                     inactive-color="#888888" @change="changeAttribute('overline')"></el-switch>
        </div>

        <div class="block">
          <span>删除线</span>
          <el-switch v-model="currentObj.linethrough" active-color="#13ce66"
                     inactive-color="#888888" @change="changeAttribute('linethrough')"></el-switch>
        </div>
      </div>

      <!--   图片属性面板-->
      <div v-else>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">水平翻转</span>
        <el-switch class="attributeSpanFlip" v-model="currentObj.flipX" active-color="#13ce66" inactive-color="#888888"
                   @change="changeAttribute('flipX')"></el-switch>
      </div>

      <div class="attributeBlock">
        <span class="attributeSpan">垂直翻转</span>
        <el-switch class="attributeSpanFlip" v-model="currentObj.flipY" active-color="#13ce66" inactive-color="#888888"
                   @change="changeAttribute('flipY')"></el-switch>
      </div>
    </el-drawer>


    <el-dialog
      title="SketchGraph介绍"
      :visible.sync="centerDialogVisible"
      width="30%"
      center>
      <p>这里是SketchGraph，一个自由的绘图软件</p>
      <br/>
      <p>命令行说明书</p>
      <p>画布大小设置：</p>
      <p>canvas.set(width,weight)</p>
      <p>canvas.clear()</p>
      <br/>
      <p>画笔设置：粗细、颜色</p>
      <p>brush.set('width',width) 设置画笔粗细</p>
      <p>brush.set('color',rgba(100, 23, 1, 1)) 设置画笔的颜色</p>
      <p>brush.set('color','red')</p>
      <br/>
      <p>字体设置：大小、重量、上划线、下划线、删除线</p>
      <p>font.set('fontSize',size)</p>
      <p>font.set('fontWeight',weight)</p>
      <p>font.set('overline',true/false)</p>
      <p>font.set('underline',true/false)</p>
      <p>font.set('overthrough',true/false)</p>
      <br/>
      <p>虚线设置</p>
      <p>dashline.set('full',length)</p>
      <p>dashline.set('space',length)</p>
      <br/>
      <p>圆：圆心、半径 center radius</p>
      <p>objectID = circle(center,radius)</p>
      <p>e.g. A = circle((100,300),60)</p>
      <br/>
      <p>长方形：top、left、width、height</p>
      <p>objectID = rect(top,left,width,height)</p>
      <p>e.g. A = rect(40,50,80,100)</p>
      <br/>
      <p>线段：两个点的位置</p>
      <p>objectID = line(pointA,pointB)</p>
      <p>e.g. A = line((40,50),(80,100))</p>
      <br/>
      <p>椭圆：圆心、rx、ry</p>
      <p>objectID = ellipse(left,top,rx,ry)</p>
      <p>e.g. A = ellipse(140,150,80,100)</p>
      <br/>
      <p>文本：文本内容、位置</p>
      <p>objectID = Text(left,top,content)</p>
      <p>e.g. A = Text(140,150,"Hello World")</p>
      <br/>
      <p>物体的操作：</p>
      <p>属性变更</p>
      <p>objectID.set('width',100)</p>
      <p>e.g. </p>
      <p>A = rect(40,50,80,100)</p>
      <p>A.set('width',500)</p>
      <p>属性获取:objectID.get('width')</p>
      <br/>
      <p>删除</p>
      <p>objectID.remove()</p>
      <p>e.g. A.remove()</p>
      <span slot="footer" class="dialog-footer">
  </span>
    </el-dialog>

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
        //阴影特性
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        currentObj: {
          obj: '',
          type: '',
          id: '00',
          newid: '00',
          stroke: 'rgba(0, 0, 0, 1)',
          strokeWidth: 0,
          fill: 'rgba(0, 0, 0, 0)',
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
          text: '',
          fontSize: 14,
          fontWeight: 'normal',
          underline: false,
          overline: false,
          linethrough: false,
        },
        textSetting: {
          fontSize: 25,
          fontWeight: 'normal',
          underline: false,
          overline: false,
          linethrough: false,
        },
        lastTextObj: null,
        activeName: 'controlPanel',
        imgSrc: '',
        isUploadImg: false,
        uploadJSON: null,
        cmd: '',
        commandHistory: [
          {
            command: '欢迎来到sketchGraph命令行面板'
          },
          {
            command: '请参照命令行手册~'
          }],
        centerDialogVisible: false,
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
        this.fabricCanvas.setHeight(800);
        //绑定画板事件，对鼠标的各个操作进行监听
        this.fabricCanvasEvent();
        // 可以通过名称来获取fabricObject
        this.fabricCanvas.backgroundColor = 'white';

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
                this.setID(this.lastTextObj, 'text');
                this.isDrawing = false;
                this.fabricCanvas.add(this.lastTextObj);
                this.lastTextObj.enterEditing();
                this.setAllObjSelectable(false);
                break;
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
            if (this.currentTool == 'pencil') {
              console.log('pencil');
              let allObj = this.fabricCanvas.getObjects();
              this.setID(allObj[allObj.length - 1], 'path');
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
        this.fabricCanvas.backgroundColor = '#ffffff';
        this.mouseFrom = {};
        this.mouseTo = {};
        this.drawingObject = null;
        this.isDrawing = false;
      },

      handleSave(command) {
        console.log(command);
        this.handleTools(command);
      },
      handleTools(tool) {
        this.currentTool = tool;
        if (this.drawingObject) {
          this.fabricCanvas.remove(this.drawingObject)
        }
        this.setAllObjSelectable(false);
        this.fabricCanvas.isDrawingMode = false;
        if (this.lastTextObj) {
          this.lastTextObj.exitEditing();
        }
        let drawingObject = null;
        let name = '';
        switch (tool) {
          case 'pencil':
            this.fabricCanvas.isDrawingMode = true;
            this.freeDraw();
            break;
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
          case 'text':
            this.activeName = 'fontSettings';
            break;
          case 'save2JSON':
            this.savetoJSON();
            break;
          case 'save2PNG':
            this.savetoImg('png');
            break;
          case 'save2JPG':
            this.savetoImg('jpg');
          default:
            break;
        }
        if (drawingObject && this.isDrawing) {
          this.setID(drawingObject, name);
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

      freeDraw() {
        this.fabricCanvas.freeDrawingBrush.width = this.drawWidth;
        this.fabricCanvas.freeDrawingBrush.color = this.drawColor;
        console.log('free', this.drawColor);
        this.fabricCanvas.freeDrawingBrush.strokeDashArray = this.dashArray;
      },

      drawRectangle() {
        let width = this.mouseTo.x - this.mouseFrom.x;
        let height = this.mouseTo.y - this.mouseFrom.y;
        let drawingObject = new fabric.Rect({
          top: this.mouseFrom.y,
          left: this.mouseFrom.x,
          width: width,
          height: height,
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
        console.log(top, left, moveX, moveY, radius, this.mouseFrom, this.mouseTo);
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
          fontWeight: this.textSetting.fontWeight,
          overline: this.textSetting.overline,
          underline: this.textSetting.underline,
          linethrough: this.textSetting.linethrough,
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

        for (let key in this.currentObj) {
          this.currentObj[key] = fabricObj.get(key);
        }
        this.currentObj.newid = fabricObj.get('id');
        this.currentObj.obj = fabricObj;
      },

      changeID() {
        console.log("change ID");
        if (!this.isIDUnique(this.currentObj.newid) && this.currentObj.id != this.currentObj.newid) {
          this.ErrorMessage("跟现有物体的id重复，请重新设置");
          this.currentObj.newid = this.currentObj.id;
          return;
        }
        this.currentObj.obj.set({'id': this.currentObj.newid});
      },

      changeAttribute(attr) {
        let attrDict = {};
        switch (attr) {
          case 'left':
          case 'top':
          case 'width':
          case 'height':
          case 'angle':
          case 'strokeWidth':
            attrDict[attr] = Number(this.currentObj[attr]);
            this.currentObj.obj.set(attrDict);
            break;
          case 'stroke':
          case 'fill':
          case 'flipX':
          case 'flipY':
          case 'radius':
          case 'rx':
          case 'ry':
          case 'fontSize':
          case 'overline':
          case 'underline':
          case 'linethrough':
          case 'text':
          case 'fontWeight':
            attrDict[attr] = this.currentObj[attr];
            this.currentObj.obj.set(attrDict);
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
          if (objects[i].get('id') == id) {
            return false;
          }
        }
        return true;
      },
      setID(fabricObj, idPre, isIDNum = true) {
        if (isIDNum) {
          let id = idPre + this.idNum;
          this.idNum++;
          while (!this.isIDUnique(id)) {
            id = idPre + idNum;
            this.idNum++;
          }
          fabricObj.set({'id': id});
        } else {
          let item = this.getItemByID(idPre);
          if (item) {
            this.fabricCanvas.remove(item);
          }
          fabricObj.set({'id': idPre});
        }

      },
      ErrorMessage(message) {
        this.$message.error(message);
      },

      addImg() {
        console.log(this.isUploadImg);
        if (this.isUploadImg) {
          let canvas = this.fabricCanvas;
          let setID = this.setID;
          console.log('33333');
          // console.log('33333', this.imgSrc);
          fabric.Image.fromURL(this.imgSrc, function (oImg) {
            canvas.add(oImg);
            setID(oImg, 'image');
          });
          this.setAllObjSelectable(false);
        } else {
          this.fabricCanvas.loadFromJSON(this.uploadJSON);
          let objs = this.fabricCanvas.getObjects();
          for (let i = 0, len = objs.length; i < len; ++i) {
            this.setID(objs[i], objs[i].get('type'));
          }
        }
      },

      getLocalImgSrc(event) {
        let reader = new FileReader();
        if (this.isUploadImg) {
          reader.readAsDataURL(event.raw);
          // 转换成功后的操作，reader.result即为转换后的DataURL ，
          reader.onload = () => {
            this.imgSrc = reader.result;
            console.log('22222')
            // console.log('22222', this.imgSrc);
          }
        } else {
          reader.readAsText(event.raw);
          reader.onload = ((e) => {
            this.uploadJSON = e.target.result;
          })
        }
      },

      judgeType(file) {
        console.log(file.type);
        if ((file.type === 'image/jpeg') || (file.type === 'image/png')) {
          this.isUploadImg = true;
          console.log('11111')
          // console.log('11111', this.imgSrc);
        } else if (file.type === 'application/json') {
          this.isUploadImg = false;
        } else {
          this.ErrorMessage("请上传JSON/JPG/PNG格式的文件");
          return false;
        }
      },

      savetoJSON() {
        let canvas = JSON.stringify(this.fabricCanvas);
        var a = document.createElement('a');
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(canvas));
        a.setAttribute('download', 'sketchGraph' + this.idNum + '.json');
        this.idNum++;
        a.click();
      },
      savetoImg(type) {
        let canvasURL = this.fabricCanvas.toDataURL(type);
        var a = document.createElement('a');
        a.setAttribute('href', canvasURL);
        a.setAttribute('download', 'sketchGraph' + this.idNum + '.' + type);
        this.idNum++;
        a.click()
      },

      getItemByID(ID) {
        let object = null, objects = this.fabricCanvas.getObjects();
        // console.log(objects);
        for (let i = 0, len = objects.length; i < len; i++) {
          if (objects[i].id && objects[i].id === ID) {
            object = objects[i];
            break;
          }
        }
        // console.log(object);
        return object;
      },

      commandLine(command) {
        this.commandHistory.push({command: command});
        this.cmd = '';
        let setCanvas = /canvas\.set\((\d+),(\d+)\)/;
        let setBrushWidth = /brush\.set\('width',(\d+)\)/;
        let setBrushColor = /brush\.set\('color',\s*(.+)\)/;
        let setFont = /font\.set\('(.+)',(.+)\)/;
        let setDashArray = /dashline\.set\('(.+)',(-?\d+)\)/;

        let clearCanvas = /canvas\.clear\(\)/;

        let buildCircle = /\s*(.+?)\s*=\s*circle\(\((\d+),(\d+)\),(\d+)\)/;
        let buildRect = /\s*(.+?)\s*=\s*rect\((\d+),(\d+),(\d+),(\d+)\)/;
        let buildLine = /\s*(.+?)\s*=\s*line\(\((\d+),(\d+)\),\((\d+),(\d+)\)\)/;
        let buildEllipse = /\s*(.+?)\s*=\s*ellipse\((\d+),(\d+),(\d+),(\d+)\)/;
        let buildText = /\s*(.+?)\s*=\s*Text\((\d+),(\d+),(.*)\)/;

        let setObjAttribute = /\s*(.+?)\s*\.set\('(.+)',(.+)\)/;
        let getObjAttribute = /\s*(.+?)\s*\.get\('(.+)'\)/;

        let removeObj = /\s*(.+?)\s*\.remove\(\)/;

        let matchRes = null;
        if ((matchRes = command.match(setCanvas)) && matchRes.length) {
          this.fabricCanvas.setWidth(Number(matchRes[1]));
          this.fabricCanvas.setHeight(Number(matchRes[2]));
        } else if ((matchRes = command.match(clearCanvas)) && matchRes.length) {
          this.handleTools('clear');
        } else if ((matchRes = command.match(setBrushWidth)) && matchRes.length) {
          this.drawWidth = Number(matchRes[1]);
        } else if ((matchRes = command.match(setBrushColor)) && matchRes.length) {
          this.drawColor = matchRes[1];
        } else if ((matchRes = command.match(setFont)) && matchRes.length) {
          if (matchRes[1] == 'fontSize') {
            matchRes[2] = Number(matchRes[2]);
          }
          this.textSetting[matchRes[1]] = matchRes[2];
          console.log(this.textSetting);
        } else if ((matchRes = command.match(setDashArray)) && matchRes.length) {
          console.log(matchRes[1]);
          if (matchRes[1] == 'full') {
            if (Number(matchRes[2]) > 0) {
              this.dashArray[0] = Number(matchRes[2]);
            } else {
              this.commandHistory.push({command: "参数需要大于0！"});
            }
          } else if (matchRes[1] == 'space') {
            if (Number(matchRes[2]) >= 0) {
              this.dashArray[1] = Number(matchRes[2]);
            } else {
              this.commandHistory.push({command: "参数需要大于等于0！"});
            }
          }
        } else if ((matchRes = command.match(buildCircle)) && matchRes.length) {
          this.mouseFrom.x = Number(matchRes[2]);
          this.mouseFrom.y = Number(matchRes[3]);
          this.mouseTo.x = this.mouseFrom.x + Number(matchRes[4]);
          this.mouseTo.y = this.mouseFrom.y;
          let fabricObj = this.drawCircle();
          this.fabricCanvas.add(fabricObj);
          this.setID(fabricObj, matchRes[1], false);
        } else if ((matchRes = command.match(buildRect)) && matchRes.length) {
          this.mouseFrom.x = Number(matchRes[2]);
          this.mouseFrom.y = Number(matchRes[3]);
          this.mouseTo.x = this.mouseFrom.x + Number(matchRes[4]);
          this.mouseTo.y = this.mouseFrom.x + Number(matchRes[5]);
          let fabricObj = this.drawRectangle();
          this.fabricCanvas.add(fabricObj);
          this.setID(fabricObj, matchRes[1], false);
        } else if ((matchRes = command.match(buildLine)) && matchRes.length) {
          this.mouseFrom.x = Number(matchRes[2]);
          this.mouseFrom.y = Number(matchRes[3]);
          this.mouseTo.x = Number(matchRes[4]);
          this.mouseTo.y = Number(matchRes[5]);
          let fabricObj = this.drawLine();
          this.fabricCanvas.add(fabricObj);
          this.setID(fabricObj, matchRes[1], false);
        } else if ((matchRes = command.match(buildEllipse)) && matchRes.length) {
          this.mouseFrom.x = Number(matchRes[2]);
          this.mouseFrom.y = Number(matchRes[3]);
          this.mouseTo.x = Number(matchRes[4]) + Number(matchRes[2]);
          this.mouseTo.y = Number(matchRes[5]) + Number(matchRes[3]);
          let fabricObj = this.drawEllipse();
          this.fabricCanvas.add(fabricObj);
          this.setID(fabricObj, matchRes[1], false);
        } else if ((matchRes = command.match(buildText)) && matchRes.length) {
          this.mouseFrom.x = Number(matchRes[2]);
          this.mouseFrom.y = Number(matchRes[3]);
          let fabricObj = this.drawText();
          fabricObj.set('text', matchRes[4]);
          this.fabricCanvas.add(fabricObj);
          this.setID(fabricObj, matchRes[1], false);
        } else if ((matchRes = command.match(setObjAttribute)) && matchRes.length) {
          this.currentObj.obj = this.getItemByID(matchRes[1]);
          this.currentObj[matchRes[2]] = matchRes[3];
          this.changeAttribute(matchRes[2]);
          console.log(matchRes);
        } else if ((matchRes = command.match(getObjAttribute)) && matchRes.length) {
          this.currentObj.obj = this.getItemByID(matchRes[1]);
          console.log(this.currentObj[matchRes[2]]);
        } else if ((matchRes = command.match(removeObj)) && matchRes.length) {
          let fabricObj = this.getItemByID(matchRes[1]);
          this.fabricCanvas.remove(fabricObj);
        } else {
          this.commandHistory.push({command: "不合规的命令！请查看手册!"});
          console.log("不合规的命令！请查看手册!")
        }
        this.setAllObjSelectable(false);
        this.updateModifications();
      },
    },
  }
</script>

<style>
  .el-main {
    background-color: #EEEEEE;
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
    margin-top: 3px;
    margin-left: 5px;
  }
  .attributeBlock .el-input{
    width:200px;
  }

  .attributeSpan {
    display: table-cell;
    vertical-align: middle;
    padding: 10px;
    width:100px;
  }

   .attributeSpanFlip {
    display: table-cell;
    vertical-align: middle;
    padding: 10px 0px;
  }

  #my-img {
    width: 0.1px;
    height: 0.1px;
    display: none;
  }

  .el-upload-dragger {
    width: 300px;
  }

  .toolsButton {
    margin-top: 5px;
  }

  el-tabs {
    width: 100%;
  }

  .el-tabs__header {
    margin: 0px;
  }

  .sketchGraphHeader {
    font-size: 50px;
    align-items: center;
  }

  .el-button {
    color: #FFF;
  }

  /*.el-table--scrollable-y{*/
  /*  height:500px !important;*/
  /*}*/

</style>
