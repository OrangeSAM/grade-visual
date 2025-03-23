<script setup>
import ScoreChart from "./components/ScoreChart.vue";
import RankingChart from "./components/RankingChart.vue";
import RankingTrendChart from "./components/RankingTrendChart.vue";
import SubjectAnalysisChart from "./components/SubjectAnalysisChart.vue";
</script>

<template>
  <div class="container">
    <h1>学生成绩可视化系统</h1>
    <div class="charts-container">
      <ScoreChart />
      <RankingChart />
      <RankingTrendChart />
      <SubjectAnalysisChart />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

@media (min-width: 1024px) {
  .charts-container {
    flex-direction: column;
  }
}
</style>
