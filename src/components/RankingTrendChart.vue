<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import gradesData from "../data/grades.json";

const chartDom = ref(null);
let myChart = null;
const currentSubject = ref("总分");
const rankType = ref("班排名");
const rankTypes = ["班排名", "校排名", "联考排名"];

// 获取所有考试和科目
const exams = Object.keys(gradesData);
const subjects = Object.keys(gradesData[exams[0]]);

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

  // 获取所选科目在各个考试中的排名数据
  const rankData = exams
    .map((exam) => {
      const subjectData = gradesData[exam][currentSubject.value];
      return subjectData[rankType.value] || null;
    })
    .filter((rank) => rank !== null);

  const validExams = exams.filter((exam) => {
    const subjectData = gradesData[exam][currentSubject.value];
    return rankType.value in subjectData;
  });

  const option = {
    title: {
      text: `${currentSubject.value}${rankType.value}变化趋势`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        return `${params[0].axisValue}<br/>${rankType.value}: ${params[0].value}`;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "80px",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: validExams,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: rankType.value,
      inverse: true, // 排名数值越小越好，所以反转坐标轴
      axisLabel: {
        formatter: "{value}",
      },
    },
    series: [
      {
        name: rankType.value,
        type: "line",
        data: rankData,
        symbol: "circle",
        symbolSize: 8,
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
        },
        itemStyle: {
          color: function (params) {
            const rank = params.value;
            if (rank <= 10) return "#ff6b6b"; // 前10名
            if (rank <= 50) return "#feca57"; // 前50名
            if (rank <= 100) return "#48dbfb"; // 前100名
            return "#c8d6e5";
          },
        },
        lineStyle: {
          width: 3,
        },
      },
    ],
  };

  myChart.setOption(option);
};

const changeSubject = (subject) => {
  currentSubject.value = subject;
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
        <label for="subject-select">选择科目:</label>
        <select
          id="subject-select"
          v-model="currentSubject"
          @change="updateChart"
        >
          <option v-for="subject in subjects" :key="subject" :value="subject">
            {{ subject }}
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
  padding: 20px;
}

.selector-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
}

.selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
}

.chart {
  height: 400px;
}
</style>
