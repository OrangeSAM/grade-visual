<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";
import gradesData from "../data/grades.json";

const chartDom = ref(null);
let myChart = null;
const currentExam = ref("考试1");
const exams = ref(Object.keys(gradesData));
const scoreType = ref("分数");
const scoreTypes = ["分数", "赋分分数", "原始分数"];

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

  const subjects = Object.keys(gradesData[exams.value[0]]).filter(
    (subject) => subject !== "总分"
  );

  // 准备所有考试的分数数据
  const allExamsData = exams.value.map((exam) => {
    const examData = gradesData[exam];
    return subjects
      .map((subject) => {
        if (scoreType.value in examData[subject]) {
          return examData[subject][scoreType.value];
        } else if (
          scoreType.value === "分数" &&
          "原始分数" in examData[subject]
        ) {
          return examData[subject]["原始分数"];
        } else if (
          scoreType.value === "分数" &&
          "赋分分数" in examData[subject]
        ) {
          return examData[subject]["赋分分数"];
        }
        return null;
      })
      .filter((score) => score !== null);
  });

  const subjectsWithScore = subjects.filter((subject, index) =>
    allExamsData.every((examData) => examData[index] !== null)
  );

  const option = {
    title: {
      text: `各科${scoreType.value}变化趋势`,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = params[0].axisValue + "<br/>";
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: subjectsWithScore,
      top: 40,
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
      data: exams.value,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: scoreType.value,
      min: function (value) {
        return Math.floor(value.min * 0.8);
      },
    },
    series: subjectsWithScore.map((subject, subjectIndex) => ({
      name: subject,
      type: "line",
      data: allExamsData.map((examData) => examData[subjectIndex]),
      symbol: "circle",
      symbolSize: 8,
      label: {
        show: true,
        position: "top",
        formatter: function (params) {
          return params.value;
        },
      },
    })),
  };

  myChart.setOption(option);
};

const changeExam = (exam) => {
  currentExam.value = exam;
  updateChart();
};

const changeScoreType = (type) => {
  scoreType.value = type;
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
        <label for="score-type-select">分数类型:</label>
        <select
          id="score-type-select"
          v-model="scoreType"
          @change="updateChart"
        >
          <option v-for="type in scoreTypes" :key="type" :value="type">
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
  width: 100%;
  height: 400px;
  margin-top: 20px;
}
</style>
