// 配置文件示例
// 复制此文件为 config.js 并修改相应配置

export const config = {
  // 基础URL
  baseUrl: 'https://x7s4zwod.yichafen.com/',
  
  // 浏览器配置
  browser: {
    headless: false, // 设为true可以无头模式运行（不显示浏览器窗口）
    timeout: 15000,  // 页面加载超时时间(毫秒)
    delay: 2000      // 请求间隔时间(毫秒)，避免请求过快
  },
  
  // 学生信息列表 - 请根据实际情况修改
  students: [
    {
      idLastFour: '2010',  // 身份证后四位
      name: '刘欣'         // 学生姓名
    },
    {
      idLastFour: '1234',
      name: '张三'
    },
    {
      idLastFour: '5678',
      name: '李四'
    }
    // 可以继续添加更多学生信息
    // {
    //   idLastFour: 'XXXX',
    //   name: '学生姓名'
    // }
  ],
  
  // 结果保存配置
  output: {
    directory: '../results',     // 结果保存目录
    format: 'json',             // 保存格式
    includeTimestamp: true      // 是否包含时间戳
  }
};

// 页面元素选择器配置 - 通常不需要修改
export const selectors = {
  // 考试列表页面
  examList: '#allList .weui-cells',
  examItem: '#allList .weui-cell',
  examTitle: 'p[style*="font-size: 16px"]',
  examDate: 'p[style*="color: #999"]',
  
  // 信息输入页面
  form: '#form-data',
  idInput: 'input[name="s_shenfenzhenghousiwei"]',
  nameInput: 'input[name="s_xingming"]',
  submitButton: '#yiDunSubmitBtn',
  
  // 结果页面
  resultContainer: '#result_content',
  resultTable: '.js_result_table tbody',
  leftCell: '.left_cell span',
  rightCell: '.right_cell'
};