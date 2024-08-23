<template>
  <canvas id="paper"></canvas>
  <div
    class="toolBar"
    v-show="toolBarVisible"
    :style="{
      left: toolBarPosition.x + 'px',
      top: toolBarPosition.y + 'px',
    }"
    ref="toolBarRef"
  >
    <div
      v-for="item in toolBar"
      class="toolBar-item"
      :title="item.title"
      @click="item.func"
    >
      <span :class="'ksdhy ' + item.icon"></span>
    </div>
  </div>
</template>

<script setup>
import paper from "paper";
import { nextTick, onMounted, ref } from "vue";
import { exportImageInfo, getImage } from "@/electron.js";

// 用于显示矩形大小的text
let text;

// 框选的Path
let path;

// 载入的图像
let raster;

// 图像原始数据
let originalImageData;

// 设置每个点移动限制条件，x，y为同步跟随移动的点，xHalf，yHalf为跟随移动一半的点
let moveConditions = {
  0: {
    x: [0, 1, 2],
    y: [0, 6, 7],
    xHalf: [3, 7],
    yHalf: [1, 5],
    cursor: "ne-resize",
  },
  1: {
    x: [1, 0, 2],
    y: [],
    xHalf: [3, 7],
    yHalf: [],
    cursor: "ew-resize",
  },
  2: {
    x: [2, 0, 1],
    y: [2, 3, 4],
    xHalf: [3, 7],
    yHalf: [1, 5],
    cursor: "nw-resize",
  },
  3: {
    x: [],
    y: [3, 2, 4],
    xHalf: [],
    yHalf: [1, 5],
    cursor: "ns-resize",
  },
  4: {
    x: [4, 5, 6],
    y: [4, 2, 3],
    xHalf: [3, 7],
    yHalf: [1, 5],
    cursor: "ne-resize",
  },
  5: {
    x: [5, 4, 6],
    y: [],
    xHalf: [3, 7],
    yHalf: [],
    cursor: "ew-resize",
  },
  6: {
    x: [6, 4, 5],
    y: [6, 0, 7],
    xHalf: [3, 7],
    yHalf: [1, 5],
    cursor: "nw-resize",
  },
  7: {
    x: [],
    y: [7, 0, 6],
    xHalf: [],
    yHalf: [1, 5],
    cursor: "ns-resize",
  },
};

const toolBarPosition = ref({ x: 0, y: 0 });
const toolBarVisible = ref(false);
const toolBarRef = ref(null);

const toolBar = [
  {
    icon: "icon-guding",
    title: "置顶",
    func: () => {
      exportImageInfo(path.bounds, originalImageData, true);
    },
  },
  {
    icon: "icon-ai210",
    title: "完成",
    func: () => {
      exportImageInfo(path.bounds, originalImageData);
    },
  },
];

/**
 * 绘制矩形的宽高信息
 * @param path
 */
const printBoundsInfo = (path) => {
  let leftTop = path.bounds.topLeft;
  // 显示矩形大小
  let content = `${path.bounds.width}x${path.bounds.height}`;
  let fontsize = 16;
  if (text) {
    text.remove();
  }
  text = new paper.PointText({
    point: [leftTop.x, leftTop.y - fontsize],
    content,
    fillColor: "white",
    fontSize: fontsize,
  });
};

/**
 * 根据path.RectAngle的segments插入control segment
 * @param path
 */
const insertControlSegment = (path) => {
  //   在矩形各边的中间位置添加segment,并且插入到对应位置
  let segments = path.segments;
  let left = segments[0].point;
  let right = segments[2].point;
  let top = segments[1].point;
  let bottom = segments[3].point;
  let leftTop = new paper.Point((left.x + top.x) / 2, (left.y + top.y) / 2);
  let rightTop = new paper.Point((right.x + top.x) / 2, (right.y + top.y) / 2);
  let leftBottom = new paper.Point(
    (left.x + bottom.x) / 2,
    (left.y + bottom.y) / 2,
  );
  let rightBottom = new paper.Point(
    (right.x + bottom.x) / 2,
    (right.y + bottom.y) / 2,
  );
  path.insert(1, leftTop);
  path.insert(3, rightTop);
  path.insert(5, rightBottom);
  path.insert(7, leftBottom);
};

/**
 * 创建control point
 * @param point
 * @return {paper.Item}
 */
const createControlPoint = (point) => {
  const length = 6;
  const color = new paper.Color(0, 0, 1);
  return new paper.Path.Rectangle({
    from: [point.x - length / 2, point.y - length / 2],
    to: [point.x + length / 2, point.y + length / 2],
    fillColor: color,
  });
};

/**
 * 更新工具栏位置
 * @param path
 */
const updateToolBarPosition = (path) => {
  let bottomRight = path.bounds.bottomRight;
  let toolBarWidth = toolBarRef.value.getClientRects()[0].width;
  let toolBarHeight = toolBarRef.value.getClientRects()[0].height;
  let x = 0;
  let y = 0;
  // 纵向判断
  let clientHeight = document.documentElement.clientHeight;
  let pathBottom = bottomRight.y;
  y =
    clientHeight - pathBottom < toolBarHeight
      ? bottomRight.y - toolBarHeight
      : bottomRight.y;

  // 横向判断
  // 默认右对齐
  x = path.bounds.right - toolBarWidth;
  if (path.bounds.left < toolBarWidth) {
    x = path.bounds.left;
  }

  toolBarPosition.value = { x, y };
};

/**
 * 创建工具栏
 * @param path
 */
const createToolBar = (path) => {
  toolBarVisible.value = true;
  nextTick(updateToolBarPosition.bind(null, path));
};

/**
 * 创建矩形框选以及相关移动逻辑
 */
const createClipRect = () => {
  // 用于存储矩形初始位置的左顶点，便于后续拖拽时基于该点绘制矩形
  let leftTop;
  let tool = new paper.Tool();
  tool.onMouseDown = function (event) {
    leftTop = event.point;
    path = new paper.Path.Rectangle({
      from: event.point,
      to: event.point,
      strokeColor: "blue",
    });
  };
  tool.onMouseDrag = function (event) {
    path.remove();
    path = new paper.Path.Rectangle({
      from: leftTop,
      to: event.point,
      strokeColor: "blue",
      strokeWidth: 1,
    });
    printBoundsInfo(path);
  };
  tool.onMouseUp = function (event) {
    if (path.bounds.width < 3 || path.bounds.height < 3) {
      text.remove();
      path.remove();
      return;
    }
    tool.remove();

    // 绘制工具栏
    createToolBar(path);

    // 插入控制点
    insertControlSegment(path);

    // path整体加个拖拽
    path.fillColor = new paper.Color(0, 0, 1, 0.00000001);
    path.onMouseDrag = (event) => {
      document.body.style.cursor = "move";
      let delta = event.delta;
      path.position.x += delta.x;
      path.position.y += delta.y;

      // 添加限制，禁止移动超出屏幕
      if (path.bounds.topLeft.x <= 0) {
        path.position.x = path.bounds.width / 2 + 1;
      } else if (path.bounds.topLeft.y <= 0) {
        path.position.y = path.bounds.height / 2 + 1;
      } else if (path.bounds.bottomRight.x >= paper.view.bounds.width) {
        path.position.x = paper.view.bounds.width - path.bounds.width / 2 - 1;
      } else if (path.bounds.bottomRight.y >= paper.view.bounds.height) {
        path.position.y = paper.view.bounds.height - path.bounds.height / 2 - 1;
      }
      controlPointSegmentMap.forEach((item) => {
        item.controlPoint.position = item.segment.point;
        item.controlPoint.position = item.segment.point;
      });

      printBoundsInfo(path); // 更新矩形大小信息
      updateToolBarPosition(path); // 更新工具栏位置
    };
    path.onMouseEnter = () => {
      document.body.style.cursor = "move";
    };
    path.onMouseLeave = () => {
      document.body.style.cursor = "default";
    };

    // 存储control点和path的segments的对应关系，方便移动circle时同步移动对应的segment
    let controlPointSegmentMap = [];

    // 添加映射关系
    path.segments.forEach((segment, index) => {
      let controlPoint = createControlPoint(segment.point);
      controlPointSegmentMap.push({
        index,
        controlPoint,
        segment,
      });
    });

    // 给每个点添加移动逻辑
    controlPointSegmentMap.forEach((item, index) => {
      item.controlPoint.onMouseDrag = (event) => {
        let delta = event.delta;
        let { x, y, xHalf, yHalf } = moveConditions[index];

        x.forEach((i) => {
          controlPointSegmentMap[i].controlPoint.position.x += delta.x;
          controlPointSegmentMap[i].segment.point.x += delta.x;
        });
        y.forEach((i) => {
          controlPointSegmentMap[i].controlPoint.position.y += delta.y;
          controlPointSegmentMap[i].segment.point.y += delta.y;
        });
        xHalf.forEach((i) => {
          controlPointSegmentMap[i].controlPoint.position.x += delta.x / 2;
          controlPointSegmentMap[i].segment.point.x += delta.x / 2;
        });
        yHalf.forEach((i) => {
          controlPointSegmentMap[i].controlPoint.position.y += delta.y / 2;
          controlPointSegmentMap[i].segment.point.y += delta.y / 2;
        });
        // 移动点时更新矩形大小信息
        printBoundsInfo(path);
        // 更新工具栏位置
        updateToolBarPosition(path);
        document.body.style.cursor = moveConditions[index].cursor;
      };
      item.controlPoint.onMouseEnter = () => {
        document.body.style.cursor = moveConditions[index].cursor;
      };
      item.controlPoint.onMouseLeave = () => {
        document.body.style.cursor = "default";
      };
    });
  };
};

onMounted(async () => {
  paper.setup("paper");
  let { base64, imageData } = await getImage();
  originalImageData = imageData;
  raster = new paper.Raster(base64);
  raster.onLoad = () => {
    raster.fitBounds(paper.view.bounds);
    createClipRect();
  };
});
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  //overflow: hidden;
  width: 100vw;
  height: 100vh;
}
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
.toolBar {
  position: absolute;
  top: -100px;
  z-index: 10;
  background: #f7f7f7;
  display: flex;
}
.toolBar-item {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  cursor: pointer;
  user-select: none;
}
</style>
