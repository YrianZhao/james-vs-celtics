# 詹姆斯 VS 凯尔特人

一个开源、纯前端、打开链接即可玩的数据卡牌对战游戏。玩家固定选择詹姆斯，通过抽卡挑战凯尔特人历史前 50 球星，用核心荣誉、生涯数据和媒体评价摘要进行自动回合对比。

## 玩法

- 点击“抽取对手”从凯尔特人历史前 50 卡池抽出对手。
- 双方各 100 点生命值。
- 系统每回合自动选择一个有解释力的数据或荣誉项目。
- 优势方造成 8-28 点伤害，直到一方血量归零。
- 每回合展示双方数值、扣血、来源标签和一条强对抗吐槽文案。

## 数据快照

数据快照日期：**2026-05-24**。

第一版只维护核心荣誉和生涯总计，不追求逐场或逐赛季数据库。詹姆斯仍是现役球员，后续真实数据变化不会自动进入本项目。

## 数据来源

本项目只保存结构化事实、短标签和来源链接，不复制长篇媒体内容。主要参考：

- [NBA.com LeBron James profile](https://www.nba.com/player/2544/lebron-james)
- [Basketball-Reference LeBron James](https://www.basketball-reference.com/players/j/jamesle01.html)
- [Basketball-Reference Boston Celtics](https://www.basketball-reference.com/teams/BOS/)
- [Lineups Top 50 Greatest Boston Celtics Players](https://www.lineups.com/articles/top-50-greatest-boston-celtics-players/)
- [Naismith Memorial Basketball Hall of Fame](https://www.hoophall.com/)

## 非官方声明

这是一个非官方球迷作品，不隶属于 NBA、Boston Celtics、Los Angeles Lakers、Cleveland Cavaliers、Miami Heat、LeBron James 或任何相关权利方。项目不包含官方 Logo、球队商标或未经授权的球员照片。

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
