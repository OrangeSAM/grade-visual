import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GradeCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://x7s4zwod.yichafen.com/';
    this.resultsDir = path.join(__dirname, '../results');
  }

  async init() {
    try {
      // 确保结果目录存在
      await fs.ensureDir(this.resultsDir);
      console.log('✓ 结果目录创建成功');
      
      // 启动浏览器
       console.log('正在启动浏览器...');
       this.browser = await puppeteer.launch({
         headless: true, // 使用传统headless模式
         defaultViewport: { width: 1280, height: 720 },
         executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
         args: [
           '--no-sandbox',
           '--disable-setuid-sandbox',
           '--disable-dev-shm-usage',
           '--disable-gpu',
           '--disable-web-security',
           '--disable-features=VizDisplayCompositor',
           '--no-first-run',
           '--disable-default-apps',
           '--disable-background-timer-throttling',
           '--disable-backgrounding-occluded-windows',
           '--disable-renderer-backgrounding',
           '--single-process',
           '--no-zygote'
         ],
         timeout: 60000 // 60秒超时
       });
      console.log('✓ 浏览器启动成功');
      
      console.log('正在创建新页面...');
      this.page = await this.browser.newPage();
      console.log('✓ 页面创建成功');
      
      // 设置用户代理
      console.log('正在设置用户代理...');
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      console.log('✓ 用户代理设置成功');
      
    } catch (error) {
      console.error('初始化失败:', error.message || error);
      await this.close();
      throw error;
    }
  }

  async getExamList() {
    console.log('正在获取考试列表...');
    
    try {
      console.log(`正在访问: ${this.baseUrl}`);
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      console.log('✓ 页面加载完成');
      
      // 等待页面完全加载
      await this.page.waitForTimeout(3000);
      
      // 检查页面标题
      const title = await this.page.title();
      console.log(`页面标题: ${title}`);
      
      // 尝试多种选择器
      const selectors = [
        '#allList .weui-cells',
        '#allList',
        '.weui-cells',
        '.weui-cell',
        'a[href*="exam"]',
        'a[href*="test"]'
      ];
      
      let foundSelector = null;
      for (const selector of selectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          foundSelector = selector;
          console.log(`✓ 找到选择器: ${selector}`);
          break;
        } catch (e) {
          console.log(`✗ 选择器不存在: ${selector}`);
        }
      }
      
      if (!foundSelector) {
        // 输出页面HTML用于调试
        const html = await this.page.content();
        console.log('页面HTML片段:', html.substring(0, 1000));
        throw new Error('未找到考试列表元素');
      }
      
      // 提取考试列表信息
      const examList = await this.page.evaluate(() => {
        // 尝试多种方式获取考试链接
        let examItems = [];
        
        // 方式1: 原始选择器
        const items1 = document.querySelectorAll('#allList .weui-cell');
        if (items1.length > 0) {
          examItems = Array.from(items1);
        }
        
        // 方式2: 所有包含href的a标签
        if (examItems.length === 0) {
          const items2 = document.querySelectorAll('a[href]');
          examItems = Array.from(items2).filter(item => 
            item.href && (item.href.includes('exam') || item.href.includes('test') || item.href.includes('query'))
          );
        }
        
        // 方式3: 所有weui-cell
        if (examItems.length === 0) {
          const items3 = document.querySelectorAll('.weui-cell');
          examItems = Array.from(items3);
        }
        
        console.log(`找到 ${examItems.length} 个潜在考试项目`);
        
        const exams = [];
        
        examItems.forEach((item, index) => {
          const link = item.getAttribute('href') || item.href;
          let title = '';
          let date = '';
          
          // 尝试多种方式获取标题和日期
          const titleElement = item.querySelector('p[style*="font-size: 16px"]') || 
                              item.querySelector('.weui-cell__bd p') ||
                              item.querySelector('p') ||
                              item;
          
          const dateElement = item.querySelector('p[style*="color: #999"]') ||
                             item.querySelector('.weui-cell__ft') ||
                             item.querySelectorAll('p')[1];
          
          if (titleElement) {
            title = titleElement.textContent || titleElement.innerText || '';
          }
          
          if (dateElement) {
            date = dateElement.textContent || dateElement.innerText || '';
          }
          
          if (link && title.trim()) {
            exams.push({
              title: title.trim(),
              date: date.trim() || '未知日期',
              link: link.startsWith('http') ? link : window.location.origin + link
            });
          }
          
          console.log(`项目 ${index + 1}: 链接=${link}, 标题=${title.trim()}, 日期=${date.trim()}`);
        });
        
        return exams;
      });
      
      console.log(`找到 ${examList.length} 个考试`);
      examList.forEach((exam, index) => {
        console.log(`  ${index + 1}. ${exam.title} (${exam.date})`);
      });
      
      return examList;
      
    } catch (error) {
      console.error('获取考试列表失败:', error.message || error);
      return [];
    }
  }

  async queryGrade(examLink, studentInfo) {
    const { idLastFour, name } = studentInfo;
    
    try {
      console.log(`正在查询 ${name} 的成绩...`);
      
      // 访问考试链接
      let fullUrl;
      if (examLink.startsWith('http')) {
        fullUrl = examLink;
      } else {
        fullUrl = this.baseUrl.replace(/\/$/, '') + (examLink.startsWith('/') ? examLink : '/' + examLink);
      }
      
      console.log(`正在访问考试链接: ${fullUrl}`);
      await this.page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 等待表单加载
      await this.page.waitForSelector('#form-data', { timeout: 10000 });
      
      // 填写身份证后四位
      await this.page.type('input[name="s_shenfenzhenghousiwei"]', idLastFour);
      
      // 填写姓名
      await this.page.type('input[name="s_xingming"]', name);
      
      // 等待验证码加载（如果有的话）
      await this.page.waitForTimeout(2000);
      
      // 点击查询按钮
      await this.page.click('#yiDunSubmitBtn');
      
      // 等待结果页面加载
      await this.page.waitForSelector('#result_content', { timeout: 15000 });
      
      // 提取成绩数据
      const gradeData = await this.page.evaluate(() => {
        const table = document.querySelector('.js_result_table tbody');
        if (!table) return null;
        
        const rows = table.querySelectorAll('tr');
        const data = {};
        
        rows.forEach(row => {
          const leftCell = row.querySelector('.left_cell span');
          const rightCell = row.querySelector('.right_cell');
          
          if (leftCell && rightCell) {
            const key = leftCell.textContent.trim();
            const value = rightCell.textContent.trim();
            data[key] = value;
          }
        });
        
        return data;
      });
      
      if (gradeData) {
        console.log(`成功获取 ${name} 的成绩`);
        return {
          success: true,
          studentInfo,
          gradeData,
          timestamp: new Date().toISOString()
        };
      } else {
        console.log(`未找到 ${name} 的成绩数据`);
        return {
          success: false,
          studentInfo,
          error: '未找到成绩数据',
          timestamp: new Date().toISOString()
        };
      }
      
    } catch (error) {
      const errorMessage = error.message || error.toString();
      console.error(`查询 ${name} 成绩失败:`, errorMessage);
      return {
        success: false,
        studentInfo,
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  async saveResults(examInfo, results) {
    const filename = `${examInfo.title.replace(/[^\w\s-]/g, '')}_${examInfo.date}.json`;
    const filepath = path.join(this.resultsDir, filename);
    
    const data = {
      examInfo,
      results,
      crawlTime: new Date().toISOString()
    };
    
    await fs.writeJson(filepath, data, { spaces: 2 });
    console.log(`结果已保存到: ${filepath}`);
  }

  async close() {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    } catch (error) {
      // 忽略关闭时的连接错误
      if (!error.message.includes('socket hang up') && 
          !error.message.includes('ECONNRESET') &&
          !error.message.includes('WebSocket')) {
        console.error('关闭浏览器时出现错误:', error.message);
      }
    }
  }

  // 批量查询多个学生的成绩
  async batchQuery(examIndex = 0, students = []) {
    try {
      await this.init();
      
      // 获取考试列表
      const examList = await this.getExamList();
      
      if (examList.length === 0) {
        console.log('未找到任何考试');
        return;
      }
      
      // 选择考试
      const selectedExam = examList[examIndex] || examList[0];
      console.log(`选择考试: ${selectedExam.title}`);
      
      const results = [];
      
      // 查询每个学生的成绩
      for (const student of students) {
        const result = await this.queryGrade(selectedExam.link, student);
        results.push(result);
        
        // 添加延迟避免请求过快
        await this.page.waitForTimeout(2000);
      }
      
      // 保存结果
      await this.saveResults(selectedExam, results);
      
      return results;
      
    } catch (error) {
      console.error('批量查询失败:', error.message || error);
      return [];
    } finally {
      await this.close();
    }
  }

  // 单个学生查询
  async singleQuery(examIndex = 0, studentInfo) {
    return await this.batchQuery(examIndex, [studentInfo]);
  }
}

export default GradeCrawler;

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const crawler = new GradeCrawler();
  
  // 示例学生信息
  const students = [
    { idLastFour: '2010', name: '刘欣' }
    // 可以添加更多学生
  ];
  
  // 查询第一个考试的成绩
  crawler.batchQuery(0, students)
    .then(results => {
      console.log('查询完成');
      if (results) {
        results.forEach(result => {
          if (result.success) {
            console.log(`${result.studentInfo.name}: 总分 ${result.gradeData['总分分数']}`);
          } else {
            console.log(`${result.studentInfo.name}: 查询失败 - ${result.error}`);
          }
        });
      }
    })
    .catch(console.error);
}