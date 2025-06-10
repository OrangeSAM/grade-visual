import GradeCrawler from './crawler.js';
import { config } from './config.js';

async function testCrawlerWithRetry() {
  const crawler = new GradeCrawler();
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`=== 成绩查询系统测试 (尝试 ${retryCount + 1}/${maxRetries}) ===`);
      
      // 初始化爬虫
      await crawler.init();
      console.log('✓ 爬虫初始化成功');
      
      // 测试获取考试列表
      console.log('\n1. 测试获取考试列表...');
      const examList = await crawler.getExamList();
      
      if (examList.length > 0) {
        console.log(`✓ 成功获取 ${examList.length} 个考试`);
        examList.slice(0, 3).forEach((exam, index) => {
          console.log(`   ${index + 1}. ${exam.title} (${exam.date})`);
        });
      } else {
        console.log('✗ 未获取到考试列表');
        throw new Error('无法获取考试列表');
      }
      
      // 测试单个学生成绩查询
      console.log('\n2. 测试成绩查询...');
      const testStudent = config.students[0];
      
      if (testStudent) {
        console.log(`正在查询学生: ${testStudent.name} (身份证后四位: ${testStudent.idLastFour})`);
        
        const result = await crawler.queryGrade(examList[0].link, testStudent);
        
        if (result.success) {
          console.log('✓ 成绩查询成功');
          console.log('成绩详情:');
          Object.entries(result.gradeData).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
          });
        } else {
          console.log(`✗ 成绩查询失败: ${result.error}`);
        }
      } else {
        console.log('✗ 未配置测试学生信息');
      }
      
      console.log('\n=== 测试成功完成 ===');
      break; // 成功则退出重试循环
      
    } catch (error) {
      retryCount++;
      console.error(`测试失败 (尝试 ${retryCount}/${maxRetries}):`, error.message || error);
      
      if (retryCount >= maxRetries) {
        console.error('\n=== 测试最终失败，已达到最大重试次数 ===');
      } else {
        console.log(`\n等待 3 秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } finally {
      // 确保浏览器被正确关闭
      await crawler.close();
    }
  }
}

// 运行测试
testCrawlerWithRetry().catch(error => {
  console.error('测试程序异常退出:', error.message || error);
  process.exit(1);
});