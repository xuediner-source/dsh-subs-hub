# dsh-subs-hub

DeepSeek Harness 订阅中心：把四家订阅收进模型选择器，无需 API Key。

- **Gemini** — Google Antigravity / Cloud Code Assist
- **GPT** — ChatGPT (Codex) OAuth
- **Grok** — X / Grok 订阅 OAuth
- **Claude** — Anthropic Claude Code 凭证

设置里出现 **订阅中心** 页，四家各自登录/退出。登录后模型选择器会出现对应模型。

用量板 [`dsh-usage-board`](https://github.com/xuediner-source/dsh-usage-board) 会读取本插件落下的登录，自动显示对应额度。

## 安装

```sh
dsh plugin --profile desktop add github:xuediner-source/dsh-subs-hub
```

重启 DSH 后打开 设置 → 订阅中心。

## 结构

- `lib/index.js` — 宿主：`/subscriptions-auth` RPC + 四家适配器
- `lib/client.js` — 设置页
- `cordis.patch.yml` — bundle 自激活（loader id = 包名）

## 协议

MIT
