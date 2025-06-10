# 快速开始指南

## 1. 安装依赖

```bash
cd /Users/hb03826/Documents/sam/grade-visual/crawl
npm install
```

## 2. 配置学生信息

编辑 `config.js` 文件，添加需要查询的学生信息：

```javascript
students: [
  {
    idLastFour: '2010',  // 身份证后四位
    name: '刘欣'         // 学生姓名
  },
  // 添加更多学生...
]
```

## 3. 运行方式

### 方式一：交互式命令行工具（推荐）

```bash
npm run cli
```

这将启动交互式界面，可以：
- 查看考试列表
- 查询单个学生成绩
- 批量查询成绩
- 查看历史结果

### 方式二：直接运行测试

```bash
npm test
```

### 方式三：批量查询（使用配置文件）

```bash
npm start
```

## 4. 查看结果

查询结果会保存在 `../results/` 目录下，文件名格式：
`考试名称_日期.json`

## 5. 常见问题

**Q: 浏览器启动失败？**
A: 检查是否安装了Chrome浏览器，或在config.js中设置 `headless: true`

**Q: 查询失败？**
A: 检查学生信息是否正确，网络是否正常

**Q: 页面加载超时？**
A: 增加config.js中的timeout值

## 6. 注意事项

- 确保网络连接稳定
- 学生信息必须准确
- 避免频繁查询
- 遵守网站使用条款