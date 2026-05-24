# 詹姆斯 VS 历史球星

一个开源、纯前端、打开链接即可玩的荣誉值对战游戏。玩家固定选择勒布朗·詹姆斯，从精选历史球星池里挑选对手，用总冠军、MVP、FMVP、最佳阵容、防守荣誉和 NBA75 等结构化荣誉进行 4 回合对战。

项目还内置了一个本地“荣誉对比 agent”：输入任意两名精选球星的中文名、英文名或常见绰号，就会基于静态资料池输出荣誉值总分、逐项对比、关键争议点和中文分析报告。它不调用后端，也不需要 API Key。

## 玩法

- 在首页选择一个历史球星作为詹姆斯的对手。
- 点击“开战”后进入 3-2-1 倒计时。
- 战斗固定 4 回合，只从荣誉项里结算，不比较总得分、篮板、助攻或媒体印象分。
- 自动模式会在倒计时后按节奏播放 4 回合。
- 手动模式需要用户自己选择本回合荣誉项；选择前不会展示双方该项数值，结算后才揭晓。
- 命中时会播放技能光效、球场震动和 HP 扣减动画；支持浏览器振动 API 的设备会轻微震动。

## 精选球星池

本期默认对手池为 19 位高讨论度历史球星：

Michael Jordan、Kobe Bryant、Stephen Curry、Magic Johnson、Larry Bird、Bill Russell、Kareem Abdul-Jabbar、Wilt Chamberlain、Shaquille O'Neal、Tim Duncan、Kevin Durant、Hakeem Olajuwon、Oscar Robertson、Jerry West、Julius Erving、Moses Malone、Nikola Jokic、Giannis Antetokounmpo、Kevin Garnett。

勒布朗·詹姆斯为固定玩家阵营，也可在荣誉 agent 中作为任意一方参与对比。

## 数据快照

数据快照日期：**2026-05-24**。

第一版只维护核心荣誉和必要的生涯展示数据，不追求逐场、逐赛季数据库。现役球员后续真实荣誉变化不会自动进入本项目。

## 数据来源

本项目只保存结构化事实、短标签和来源链接，不复制长篇媒体内容。主要参考：

- [NBA.com LeBron James profile](https://www.nba.com/player/2544/lebron-james)
- [NBA 75th Anniversary Team](https://www.nba.com/news/nba-75th-anniversary-team-announced)
- [Basketball-Reference Awards Index](https://www.basketball-reference.com/awards/)
- [Basketball-Reference LeBron James](https://www.basketball-reference.com/players/j/jamesle01.html)
- [Basketball-Reference player pages](https://www.basketball-reference.com/players/)
- [Naismith Memorial Basketball Hall of Fame](https://www.hoophall.com/)

## 非官方声明

这是一个非官方球迷作品，不隶属于 NBA、任何球队、球员或相关权利方。项目不包含官方 Logo、球队商标或未经授权的球员照片。

## 本地开发

```bash
npm install
npm run dev
```

测试与构建：

```bash
npm test
npm run build
```

## GitHub Pages

仓库包含 `.github/workflows/deploy.yml`。推送到 `main` 后，GitHub Actions 会运行测试、构建并发布 `dist/` 到 GitHub Pages。

项目使用相对资源路径构建，适配 GitHub Pages 的仓库子路径。

## License

MIT
