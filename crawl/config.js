// 爬虫配置文件
export const config = {
  // 基础URL
  baseUrl: 'https://x7s4zwod.yichafen.com/',
  
  // 浏览器配置
  browser: {
    headless: false, // 是否无头模式
    timeout: 15000,  // 超时时间(毫秒)
    delay: 2000      // 请求间隔(毫秒)
  },
  
  // 学生信息列表
  students: [
    {
      idLastFour: '2010',
      name: '刘欣'
    }
    // 可以添加更多学生信息
    // {
    //   idLastFour: 'XXXX',
    //   name: '学生姓名'
    // }
  ],
  
  // 结果保存配置
  output: {
    directory: '../results',
    format: 'json',
    includeTimestamp: true
  }
};

// 选择器配置
export const selectors = {
  examList: '#allList .weui-cells',
  examItem: '#allList .weui-cell',
  examTitle: 'p[style*="font-size: 16px"]',
  examDate: 'p[style*="color: #999"]',
  
  form: '#form-data',
  idInput: 'input[name="s_shenfenzhenghousiwei"]',
  nameInput: 'input[name="s_xingming"]',
  submitButton: '#yiDunSubmitBtn',
  
  resultContainer: '#result_content',
  resultTable: '.js_result_table tbody',
  leftCell: '.left_cell span',
  rightCell: '.right_cell'
};