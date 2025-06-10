#!/usr/bin/env node

import GradeCrawler from './crawler.js';
import { config } from './config.js';
import readline from 'readline';
import fs from 'fs-extra';
import path from 'path';

class GradeCrawlerCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.crawler = new GradeCrawler();
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async showMenu() {
    console.log('\n=== 成绩查询系统 ===');
    console.log('1. 查看考试列表');
    console.log('2. 查询单个学生成绩');
    console.log('3. 批量查询成绩');
    console.log('4. 查看历史结果');
    console.log('5. 退出');
    
    const choice = await this.question('请选择操作 (1-5): ');
    return choice.trim();
  }

  async showExamList() {
    try {
      console.log('\n正在获取考试列表...');
      await this.crawler.init();
      
      const examList = await this.crawler.getExamList();
      
      if (examList.length === 0) {
        console.log('未找到任何考试');
        return null;
      }
      
      console.log('\n可用考试列表:');
      examList.forEach((exam, index) => {
        console.log(`${index + 1}. ${exam.title} (${exam.date})`);
      });
      
      return examList;
    } catch (error) {
      console.error('获取考试列表失败:', error.message);
      return null;
    }
  }

  async querySingleStudent() {
    try {
      const examList = await this.showExamList();
      if (!examList) return;
      
      const examIndex = await this.question('\n请选择考试编号: ');
      const selectedExam = examList[parseInt(examIndex) - 1];
      
      if (!selectedExam) {
        console.log('无效的考试编号');
        return;
      }
      
      console.log(`\n选择的考试: ${selectedExam.title}`);
      
      const idLastFour = await this.question('请输入身份证后四位: ');
      const name = await this.question('请输入学生姓名: ');
      
      console.log('\n正在查询成绩...');
      
      const result = await this.crawler.queryGrade(selectedExam.link, {
        idLastFour: idLastFour.trim(),
        name: name.trim()
      });
      
      if (result.success) {
        console.log('\n✓ 查询成功!');
        console.log('成绩详情:');
        Object.entries(result.gradeData).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
        
        // 保存单个结果
        await this.crawler.saveResults(selectedExam, [result]);
      } else {
        console.log(`\n✗ 查询失败: ${result.error}`);
      }
      
    } catch (error) {
      console.error('查询过程中出现错误:', error.message);
    }
  }

  async batchQuery() {
    try {
      const examList = await this.showExamList();
      if (!examList) return;
      
      const examIndex = await this.question('\n请选择考试编号: ');
      const selectedExam = examList[parseInt(examIndex) - 1];
      
      if (!selectedExam) {
        console.log('无效的考试编号');
        return;
      }
      
      console.log(`\n选择的考试: ${selectedExam.title}`);
      console.log(`配置的学生数量: ${config.students.length}`);
      
      const confirm = await this.question('确认开始批量查询? (y/n): ');
      if (confirm.toLowerCase() !== 'y') {
        console.log('已取消查询');
        return;
      }
      
      console.log('\n开始批量查询...');
      
      const results = [];
      for (let i = 0; i < config.students.length; i++) {
        const student = config.students[i];
        console.log(`正在查询 ${i + 1}/${config.students.length}: ${student.name}`);
        
        const result = await this.crawler.queryGrade(selectedExam.link, student);
        results.push(result);
        
        if (result.success) {
          console.log(`  ✓ ${student.name}: 总分 ${result.gradeData['总分分数']}`);
        } else {
          console.log(`  ✗ ${student.name}: ${result.error}`);
        }
        
        // 添加延迟
        if (i < config.students.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.browser.delay));
        }
      }
      
      // 保存结果
      await this.crawler.saveResults(selectedExam, results);
      
      console.log('\n批量查询完成!');
      const successCount = results.filter(r => r.success).length;
      console.log(`成功: ${successCount}/${results.length}`);
      
    } catch (error) {
      console.error('批量查询过程中出现错误:', error.message);
    }
  }

  async showHistoryResults() {
    try {
      const resultsDir = path.join(process.cwd(), '../results');
      
      if (!await fs.pathExists(resultsDir)) {
        console.log('\n暂无历史查询结果');
        return;
      }
      
      const files = await fs.readdir(resultsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        console.log('\n暂无历史查询结果');
        return;
      }
      
      console.log('\n历史查询结果:');
      jsonFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
      
      const choice = await this.question('\n请选择要查看的结果文件编号 (回车跳过): ');
      
      if (choice.trim()) {
        const selectedFile = jsonFiles[parseInt(choice) - 1];
        if (selectedFile) {
          const filePath = path.join(resultsDir, selectedFile);
          const data = await fs.readJson(filePath);
          
          console.log(`\n=== ${data.examInfo.title} ===`);
          console.log(`考试日期: ${data.examInfo.date}`);
          console.log(`查询时间: ${data.crawlTime}`);
          console.log(`学生数量: ${data.results.length}`);
          
          data.results.forEach(result => {
            if (result.success) {
              console.log(`\n${result.studentInfo.name}:`);
              console.log(`  总分: ${result.gradeData['总分分数']}`);
              console.log(`  班排: ${result.gradeData['总分班排']}`);
              console.log(`  校排: ${result.gradeData['总分校排']}`);
            } else {
              console.log(`\n${result.studentInfo.name}: 查询失败 - ${result.error}`);
            }
          });
        }
      }
      
    } catch (error) {
      console.error('查看历史结果时出现错误:', error.message);
    }
  }

  async run() {
    console.log('欢迎使用成绩查询系统!');
    
    try {
      while (true) {
        const choice = await this.showMenu();
        
        switch (choice) {
          case '1':
            await this.showExamList();
            await this.crawler.close();
            break;
          case '2':
            await this.querySingleStudent();
            await this.crawler.close();
            break;
          case '3':
            await this.batchQuery();
            await this.crawler.close();
            break;
          case '4':
            await this.showHistoryResults();
            break;
          case '5':
            console.log('再见!');
            return;
          default:
            console.log('无效选择，请重新输入');
        }
        
        await this.question('\n按回车键继续...');
      }
    } catch (error) {
      console.error('程序运行出现错误:', error.message);
    } finally {
      await this.crawler.close();
      this.rl.close();
    }
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new GradeCrawlerCLI();
  cli.run().catch(console.error);
}