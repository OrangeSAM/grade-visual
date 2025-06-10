# 成绩查询系统爬虫

这是一个用于自动化查询学生成绩的爬虫工具，可以访问成绩查询系统，获取考试列表，并批量查询学生成绩。

## 功能特性

- 🔍 自动获取考试列表
- 📝 批量查询学生成绩
- 💾 自动保存查询结果
- ⚙️ 可配置的查询参数
- 🛡️ 错误处理和重试机制

## 安装依赖

```bash
cd /Users/hb03826/Documents/sam/grade-visual/crawl
npm install
```

## 配置说明

### 1. 学生信息配置

编辑 `config.js` 文件，添加需要查询的学生信息：

```javascript
students: [
  {
    idLastFour: '2010',  // 身份证后四位
    name: '刘欣'         // 学生姓名
  },
  {
    idLastFour: 'XXXX',
    name: '其他学生'
  }
  // 可以添加更多学生
]
```

### 2. 爬虫配置

可以在 `config.js` 中调整以下参数：

- `headless`: 是否无头模式运行（false可以看到浏览器操作过程）
- `timeout`: 页面加载超时时间
- `delay`: 请求间隔时间

## 使用方法

### 1. 运行测试

```bash
npm test
```

这将运行测试脚本，验证爬虫功能是否正常。

### 2. 批量查询成绩

```bash
npm start
```

这将使用配置文件中的学生信息，批量查询第一个考试的成绩。

### 3. 编程方式使用

```javascript
import GradeCrawler from './crawler.js';

const crawler = new GradeCrawler();

// 查询单个学生
const result = await crawler.singleQuery(0, {
  idLastFour: '2010',
  name: '刘欣'
});

// 批量查询
const students = [
  { idLastFour: '2010', name: '刘欣' },
  { idLastFour: 'XXXX', name: '其他学生' }
];
const results = await crawler.batchQuery(0, students);
```

## 结果保存

查询结果会自动保存到 `../results/` 目录下，文件名格式为：
`考试名称_日期.json`

结果文件包含：
- 考试信息
- 每个学生的查询结果
- 爬取时间戳

## 注意事项

1. **网络连接**: 确保网络连接稳定，能够访问目标网站
2. **验证码处理**: 如果网站有验证码，可能需要手动处理
3. **请求频率**: 避免请求过于频繁，已内置延迟机制
4. **数据准确性**: 请确保输入的学生信息准确无误
5. **合规使用**: 请遵守网站使用条款，仅用于合法目的

## 错误处理

爬虫包含完善的错误处理机制：

- 网络超时自动重试
- 页面加载失败提示
- 学生信息错误记录
- 详细的错误日志

## 文件结构

```
crawl/
├── package.json          # 依赖配置
├── crawler.js           # 主爬虫脚本
├── config.js            # 配置文件
├── test.js              # 测试脚本
├── README.md            # 使用说明
├── 信息输入页.html        # 参考页面结构
├── 列表页.html           # 参考页面结构
└── 考试结果页.html        # 参考页面结构
```

## 技术栈

- **Puppeteer**: 浏览器自动化
- **Cheerio**: HTML解析（备用）
- **fs-extra**: 文件系统操作
- **Node.js**: 运行环境

## 故障排除

### 常见问题

1. **浏览器启动失败**
   - 检查系统是否安装了Chrome/Chromium
   - 尝试设置 `headless: true`

2. **页面加载超时**
   - 检查网络连接
   - 增加 `timeout` 配置值

3. **找不到元素**
   - 网站结构可能已更新
   - 检查 `config.js` 中的选择器配置

4. **查询失败**
   - 验证学生信息是否正确
   - 检查是否有验证码需要处理

## 更新日志

- v1.0.0: 初始版本，支持基本的成绩查询功能