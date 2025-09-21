# THREE.BasicThirdPersonGame —— 增强版第三人称 3D 游戏脚手架

基于 THREE.js r61 与 Cannon.js 0.5.0 的第三人称 3D 游戏入门框架，内置输入系统、角色控制、物理碰撞、摄像机跟随以及可扩展的关卡逻辑。本仓库在原始示例的基础上提供了增强 Demo、可交互评分系统和 Playwright 自动化测试，方便你在 GitHub Pages 上快速发布演示页面。

## 核心特性
- **模块化架构**：js/game/ 目录按功能拆分渲染、物理、事件、UI 等模块，便于定制。
- **物理与渲染联动**：利用 Cannon.js 管理刚体与碰撞，THREE.js 负责可视化，同步更新确保表现一致。
- **增强 Demo**：默认首页（index.html）展示收集物、移动平台、分数面板等玩法元素。
- **自动化测试**：Playwright 端到端脚本覆盖页面加载、玩家输入、积分与平台逻辑。

## 快速开始
1. 安装依赖：
pm install
2. 启动本地静态服务器：python -m http.server 8000
3. 打开浏览器访问 http://localhost:8000/

> 若使用 VS Code Live Server 或其它 HTTP 服务，请确保根目录即仓库根，并保持端口与测试配置一致（默认 8000）。

## 构建与测试
- 
px grunt：压缩 js/libs/、js/game/ 中的脚本并生成 js/dist/ 和聚合文件 js/game.js
- 
px playwright test：运行完整 Playwright 测试套件，自动在 8000 端口启动 python -m http.server
- 
px playwright test --ui：以交互界面调试测试用例

建议在提交前依次执行以上命令，保证构建产物与测试结果可复现。

## GitHub Pages 发布指南
1. 仓库设置 → Pages，选择 main 分支与根目录（/）
2. 构建完成后，GitHub 会以 index.html 作为入口暴露静态站点
3. 若需要多 Demo，可保留 demo*.html，并在 index.html 内添加导航链接

初次部署后通常需等待数分钟，站点将通过 https://<用户名>.github.io/<仓库名>/ 访问。

## 目录结构
`
├─doc/                 文档与设计说明
├─js/
│  ├─game/             游戏模块（核心逻辑、事件、模型等）
│  └─libs/             固定版本的 THREE.js、Cannon.js、Detector.js 等
├─tests/               Playwright 测试脚本
├─playwright.config.js 测试与本地服务器配置
├─index.html           增强 Demo（GitHub Pages 默认首页）
└─AGENTS.md            协作者指南
`

## 许可协议
项目以 [MIT](LICENSE) 协议开源，可自由用于学习、修改与商用，但请在再分发时保留原始许可信息。
