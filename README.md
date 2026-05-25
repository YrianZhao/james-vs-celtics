# NBA 球队经理线上对抗

一个开源、纯前端、可部署到 GitHub Pages 的球队经理对战游戏。玩家通过房间号和密码创建或加入房间，双方各选五名球星，系统随机抽取每名球员的生涯时期能力，再进行五个回合的经理对抗。

## 当前玩法

- 创建房间：输入房间号和密码，等待另一名玩家加入。
- 加入房间：另一名玩家输入相同房间号和密码即可连接。
- 选择阵容：双方从 300 人争议球星池中各选 5 名球员。
- 随机时期：开战时每名球员会随机抽到一个生涯时期，例如詹姆斯骑士 1.0、热火巅峰、骑士 2.0，姚明新秀期、巅峰低位轴心、季后赛硬解版本等。
- 五回合结算：每一组球员按随机重点能力互相比拼，包括进攻、防守、组织、篮板、运动、关键和气场。
- 单机试玩：没有对手时也可以随机五人，并让系统补一个电脑/对手阵容。

## 技术说明

- 前端：React + Vite + TypeScript。
- 线上房间：PeerJS 浏览器点对点连接。
- 部署：GitHub Pages。
- 不需要账号登录，也没有服务器保存对局。

PeerJS 第一版适合轻量双人房间。如果后续需要排行榜、断线重连、观战、反作弊、长期用户数据或真正稳定的公共房间列表，建议升级到 Supabase、Firebase 或自建 WebSocket 后端。

## 球星池

本期维护 300 人争议球星池，包括 Michael Jordan、LeBron James、Kobe Bryant、Stephen Curry、Magic Johnson、Larry Bird、Kareem Abdul-Jabbar、姚明、Tracy McGrady、Allen Iverson、Nikola Jokic、Giannis Antetokounmpo、Kevin Durant 等。

前几位历史级球星和姚明拥有手工时期配置，其余球员根据位置、荣誉、争议热度生成三段游戏化时期能力。能力值是娱乐模拟快照，不代表真实排名或实时数据。

## 数据快照

数据快照日期：**2026-05-24**。

本项目只保存结构化事实、短标签和来源链接，不复制长篇媒体内容。主要参考：

- [NBA 75th Anniversary Team](https://www.nba.com/news/nba-75th-anniversary-team-announced)
- [Basketball-Reference Awards Index](https://www.basketball-reference.com/awards/)
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
