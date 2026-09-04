# dsh-subs-hub

[English](#english) | [中文说明](#中文说明)

---

## 中文说明

DeepSeek Harness 订阅中心：将主流 AI 订阅服务统一接入 DSH 模型选择器，**无需手动配置 API Key**。

### 🌟 特性

- **零 API Key 接入**：基于 OAuth PKCE / 设备码 / 本地客户端授权流直接打通订阅。
- **智能代理与直连容灾**：检测到本地代理掐流或异常中断（`ECONNREFUSED`、`UND_ERR_SOCKET`、`other side closed`）时，自动降级为直连重试，保障模型推理链路不中断。
- **Gemini 3 思维签名保持**：自动捕获并回传 `thought_signature`，彻底解决复杂 Tool Call 下缺少签名导致的 HTTP 400 异常。
- **安全原子存储**：凭证持久化至用户主目录 `~/.dsh/subscriptions-auth.json`，中间目录与凭证文件强制限定宿主用户私有权限（`0o700` / `0o600`），采用临时文件 + rename 原子写入。
- **与用量看板联动**：配合 [`dsh-usage-board`](https://github.com/xuediner-source/dsh-usage-board) 可直接在悬浮窗中监控各家订阅的配额和重置周期。

---

### 📋 支持的 Provider 与解锁模型

| Provider | 登录方式 | 前置条件 | 解锁模型示例 |
| :--- | :--- | :--- | :--- |
| **Gemini** (Antigravity) | Google OAuth PKCE | Google 账号 (包含 Cloud Code Assist 免费/付费配额) | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.0-flash` |
| **GPT** (Codex) | ChatGPT Codex OAuth | ChatGPT Plus / Pro 订阅 | `chatgpt-4o-latest`, `o3-mini`, `o1`, `gpt-4o` |
| **Grok** | xAI Grok OAuth | X (Twitter) Premium / Premium+ 订阅 | `grok-2`, `grok-2-mini`, `grok-3` |
| **Claude** | 本机凭据读取 | 本机已安装并登录 Claude Code CLI (`~/.claude/.credentials.json`) | `claude-3-7-sonnet`, `claude-3-5-sonnet`, `claude-3-5-haiku` |
| **Qwen** (通义千问) | 设备码快速登录 | 阿里云 / 通义账号 (浏览器访问验证码授权) | `qwen-max`, `qwen-plus`, `qwen-turbo` |
| **OpenRouter** | OAuth PKCE | OpenRouter 账号 | `openrouter/auto`, `openrouter/*` (根据账号模型库) |
| **Agnes AI** | OAuth PKCE | Agnes 账号订阅 | `agnes/*` |
| **讯飞星火** (Spark) | OAuth PKCE | 讯飞开放平台账号 | `spark-max`, `spark-pro` |
| **文心一言** (ERNIE) | OAuth PKCE | 百度千帆/文心账号 | `ernie-4.0`, `ernie-3.5` |

---

### 🚀 安装与使用

```sh
dsh plugin --profile desktop add github:xuediner-source/dsh-subs-hub
```

重启 DSH 后，前往 **设置 (Settings) → 订阅中心 (Subscriptions Hub)** 即可管理各 Provider 的登录态。

#### 常见场景与故障排查
1. **浏览器无法自动完成重定向回调？**
   - 登录中状态下，设置卡片内提供手动输入框：直接将浏览器地址栏中的完整重定向 URL 或授权码粘贴并点击“提交”，即可完成登录。
2. **代理软件导致断流？**
   - 插件已内置代理健康度嗅探，遇断流自动通过 Undici 直连重试。推荐的分流配置规则可参考 [`docs/ai-proxy-rules.yaml`](docs/ai-proxy-rules.yaml)。

---

### 🛡️ 安全性与隐私说明

- 所有 Access Token 与 Refresh Token 均且仅保存在您本地操作系统的用户个人目录中，绝不向任何第三方中继服务器发送或备份凭据。
- 内置 Loopback 回调服务器限制全局最大并发数并设有严格超时机制，认证完成或失败立即安全销毁。

---

<a name="english"></a>
## English

DeepSeek Harness Subscriptions Hub: Connect multi-provider AI subscriptions directly into the DSH model selector **without requiring API keys**.

### 🌟 Key Highlights

- **Direct Subscription Integration**: Authenticate via standard OAuth 2.0 PKCE, Device Authorization Flow, or local CLI credentials.
- **Resilient Fallback**: Auto-detects local proxy failures (`ECONNREFUSED`, `UND_ERR_SOCKET`, socket hang-ups) and automatically retries with direct connections.
- **Gemini 3 Thought Signatures**: Captures and re-injects `thought_signature` across multi-turn tool calls to prevent HTTP 400 validation failures.
- **Atomic & Secure Storage**: Credentials are saved atomically to `~/.dsh/subscriptions-auth.json` with user-only permissions (`0o700` dir / `0o600` file).
- **Ecosystem Integration**: Seamlessly works alongside [`dsh-usage-board`](https://github.com/xuediner-source/dsh-usage-board) for live quota tracking.

### 📦 Installation

```sh
dsh plugin --profile desktop add github:xuediner-source/dsh-subs-hub
```

After restarting DSH, open **Settings → Subscriptions Hub**.

### 🧪 Tests & Quality Assurance

```sh
# Syntax verification
npm run check

# Run automated tests (in-process node:test runner)
npm test
```

### 📄 License

MIT © [xuediner-source](https://github.com/xuediner-source)
