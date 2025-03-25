<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import gradesData from "../data/grades.json";

const chartDom = ref(null);
let myChart = null;
const currentExam = ref("考试1");
const exams = ref(Object.keys(gradesData));
const rankType = ref("班排名");
const rankTypes = ["班排名", "校排名", "联考排名"];

const initChart = () => {
  if (!chartDom.value) return;

  myChart = echarts.init(chartDom.value);
  updateChart();

  window.addEventListener("resize", () => {
    myChart.resize();
  });
};

const updateChart = () => {
  if (!myChart) return;

  const examData = gradesData[currentExam.value];
  const subjects = Object.keys(examData);

  // 准备排名数据
  const rankData = subjects
    .map((subject) => {
      if (rankType.value in examData[subject]) {
        return examData[subject][rankType.value];
      }
      return null;
    })
    .filter((rank) => rank !== null);

  const subjectsWithRank = subjects.filter(
    (subject) => rankType.value in examData[subject]
  );

  // 反转排名数据（因为排名越小越好）
  const maxRank = Math.max(...rankData) + 10; // 添加一些边距
  const invertedRankData = rankData.map((rank) => maxRank - rank);

  const option = {
    title: {
      text: `${currentExam.value} ${rankType.value}情况`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const dataIndex = params[0].dataIndex;
        const subject = subjectsWithRank[dataIndex];
        const rank = rankData[dataIndex];
        return `${subject}<br/>${rankType.value}: ${rank}`;
      },
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: subjectsWithRank,
        axisTick: {
          alignWithLabel: true,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        inverse: true, // 反转Y轴，使排名靠上的显示在上方
        name: rankType.value,
        axisLabel: {
          formatter: function (value) {
            return maxRank - value; // 显示实际排名
          },
        },
      },
    ],
    series: [
      {
        name: rankType.value,
        type: "bar",
        barWidth: "60%",
        data: invertedRankData,
        itemStyle: {
          color: function (params) {
            // 根据排名设置不同的颜色
            const rank = rankData[params.dataIndex];
            if (rank <= 10) return "#ff6b6b"; // 前10名
            if (rank <= 50) return "#feca57"; // 前50名
            if (rank <= 100) return "#48dbfb"; // 前100名
            return "#c8d6e5";
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: function (params) {
            const dataIndex = params.dataIndex;
            return rankData[dataIndex];
          },
        },
      },
    ],
  };

  myChart.setOption(option);
};

const changeExam = (exam) => {
  currentExam.value = exam;
  updateChart();
};

const changeRankType = (type) => {
  rankType.value = type;
  updateChart();
};

onMounted(() => {
  initChart();
});
</script>

<template>
  <div class="chart-container">
    <div class="selector-container">
      <div class="selector">
        <label for="exam-select">选择考试:</label>
        <select id="exam-select" v-model="currentExam" @change="updateChart">
          <option v-for="exam in exams" :key="exam" :value="exam">
            {{ exam }}
          </option>
        </select>
      </div>
      <div class="selector">
        <label for="rank-type-select">排名类型:</label>
        <select id="rank-type-select" v-model="rankType" @change="updateChart">
          <option v-for="type in rankTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
    </div>
    <div ref="chartDom" class="chart"></div>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--surface-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.selector-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  gap: 24px;
}

.selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

select {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--primary-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.95em;
  cursor: pointer;
  transition: all 0.3s ease;
}

select:hover {
  border-color: var(--primary-hover);
  background-color: var(--surface-color);
}

select:focus {
  outline: none;
  border-color: var(--primary-hover);
  box-shadow: 0 0 0 2px rgba(124, 131, 255, 0.2);
}

.chart {
  height: 400px;
  margin-top: 12px;
}
</style>
