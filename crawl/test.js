import GradeCrawler from './crawler.js';
import { config } from './config.js';

async function testCrawler() {
  const crawler = new GradeCrawler();
  
  try {
    console.log('=== 成绩查询系统测试 ===');
    
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
      return;
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
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    await crawler.close();
    console.log('\n=== 测试完成 ===');
  }
}

// 运行测试
testCrawler().catch(console.error);