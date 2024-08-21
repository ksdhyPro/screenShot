<template>
  <canvas id="paper"></canvas>
</template>

<script setup>
import paper from "paper";
import { nextTick, onMounted } from "vue";

/**
 * 异步移动
 * @param {Map} map
 */
function syncMove(map) {
  //    矩形四个端点移动逻辑,同步移动
  let index = 0;
  map.forEach((segment, circle) => {
    let nextIndex = (index + 1) % 2;
    let nextSegment = Array.from(map.values())[nextIndex];
    circle.onMouseDrag = function (event) {
      let delta = event.point.subtract(circle.position);
      circle.position = event.point;
      segment.point = segment.point.add(delta);
      nextSegment.point = nextSegment.point.add(delta);
    };
    index++;
  });
}

onMounted(() => {
  paper.setup("paper");
  let raster = new paper.Raster("/1.png");
  raster.onLoad = () => {
    raster.fitBounds(paper.view.bounds);
    let isCompleted = false;
    let path;
    let leftTop1;
    let tool = new paper.Tool();
    tool.onMouseDown = function (event) {
      if (isCompleted) return;
      leftTop1 = event.point;
      path = new paper.Path.Rectangle({
        from: event.point,
        to: event.point,
        strokeColor: "blue",
      });
    };
    tool.onMouseDrag = function (event) {
      if (isCompleted) return;
      path.remove();
      path = new paper.Path.Rectangle({
        from: leftTop1,
        to: event.point,
        strokeColor: "blue",
      });
    };
    tool.onMouseUp = function (event) {
      if (isCompleted) return;
      // 销毁tool
      tool.remove();
      path.remove();
      path = new paper.Path.Rectangle({
        from: leftTop1,
        to: event.point,
        strokeColor: "blue",
      });
      isCompleted = true;
      //   在矩形各边的中间位置添加segment,并且插入到对应位置
      let segments = path.segments;
      let center = path.bounds.center;
      let left = segments[0].point;
      let right = segments[2].point;
      let top = segments[1].point;
      let bottom = segments[3].point;
      let leftTop = new paper.Point((left.x + top.x) / 2, (left.y + top.y) / 2);
      let rightTop = new paper.Point(
        (right.x + top.x) / 2,
        (right.y + top.y) / 2,
      );
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

      let circleMap = new Map();
      path.segments.forEach((segment) => {
        let circle = new paper.Path.Circle({
          center: segment.point,
          radius: 5,
          fillColor: "red",
        });
        //   存储circle和segment的映射关系
        circleMap.set(circle, segment);
        syncMove(circleMap);
      });
    };
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
</style>
