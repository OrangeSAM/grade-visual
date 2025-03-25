<script setup>
import { ref, onMounted, computed } from "vue";
import * as echarts from "echarts";
import gradesData from "../data/grades.json";

const chartDom = ref(null);
let myChart = null;
const currentExam = ref("考试1");
const exams = ref(Object.keys(gradesData));
const analysisType = ref("成绩");
const analysisTypes = ["成绩", "班排名", "校排名", "联考排名"];

const subjectData = computed(() => {
  const examData = gradesData[currentExam.value];
  const subjects = Object.keys(examData);

  if (analysisType.value === "成绩") {
    return subjects.map((subject) => ({
      subject,
      value: examData[subject].score || 0,
    }));
  } else {
    return subjects.map((subject) => ({
      subject,
      value: examData[subject][analysisType.value] || 0,
    }));
  }
});

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

  const data = subjectData.value;
  const subjects = data.map((item) => item.subject);
  const values = data.map((item) => item.value);

  const option = {
    title: {
      text: `${currentExam.value}各科目${analysisType.value}分析`,
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    radar: {
      indicator: subjects.map((subject) => ({
        name: subject,
        max: analysisType.value === "成绩" ? 150 : 500, // 根据分析类型设置最大值
      })),
      center: ["50%", "60%"],
      radius: "65%",
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: values,
            name: analysisType.value,
            itemStyle: {
              color: "#48dbfb",
            },
            areaStyle: {
              color: "rgba(72, 219, 251, 0.3)",
            },
            label: {
              show: true,
              formatter: "{c}",
            },
          },
        ],
      },
    ],
  };

  if (analysisType.value !== "成绩") {
    option.radar.inverse = true; // 排名数值越小越好，所以反转坐标轴
  }

  myChart.setOption(option);
};

const changeExam = (exam) => {
  currentExam.value = exam;
  updateChart();
};

const changeAnalysisType = (type) => {
  analysisType.value = type;
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
        <label for="analysis-type-select">分析维度:</label>
        <select
          id="analysis-type-select"
          v-model="analysisType"
          @change="updateChart"
        >
          <option v-for="type in analysisTypes" :key="type" :value="type">
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
