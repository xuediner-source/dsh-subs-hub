window.__ModuleLoader__.load({
	id: "dsh-subs-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let react = require("react");
		let jsxRuntime = require("react/jsx-runtime");
		const { useState, useEffect, useCallback, useRef } = react;
		const { jsx, jsxs, Fragment } = jsxRuntime;

		const CHANNEL = "/subscriptions-auth";
		const PROVIDERS = [
			{ id: "antigravity", name: "Gemini" },
			{ id: "codex", name: "GPT (ChatGPT)" },
			{ id: "grok", name: "Grok" },
			{ id: "claude", name: "Claude" }
		];

		async function rpcCall(rpc, endpoint, payload) {
			const result = await rpc.call(CHANNEL, endpoint, payload);
			if (!result || result.ok !== true) {
				const msg = result && result.error ? result.error.message : "RPC 失败";
				throw new Error(msg);
			}
			return result.value;
		}

		function SubscriptionsSection(props) {
			const [statuses, setStatuses] = useState({});
			const [errors, setErrors] = useState({});
			const [loading, setLoading] = useState(true);
			const mounted = useRef(true);
			const pollers = useRef({});

			const refresh = useCallback(async () => {
				const rpc = props.rpc;
				if (!rpc) return;
				try {
					const value = await rpcCall(rpc, "status", {});
					if (!mounted.current) return;
					const providers = value.providers || {};
					setStatuses(providers);
					setLoading(false);
					setErrors((prev) => {
						const next = { ...prev };
						delete next._global;
						for (const { id } of PROVIDERS) {
							const detail = providers[id] && providers[id].detail;
							if (typeof detail === "string" && detail) next[id] = detail;
							else delete next[id];
						}
						return next;
					});
				} catch (error) {
					if (!mounted.current) return;
					setLoading(false);
					setErrors((e) => ({ ...e, _global: error instanceof Error ? error.message : String(error) }));
				}
			}, [props.rpc]);

			useEffect(() => {
				mounted.current = true;
				refresh();
				return () => {
					mounted.current = false;
					for (const t of Object.values(pollers.current)) clearInterval(t);
					pollers.current = {};
				};
			}, [refresh]);

			useEffect(() => {
				for (const { id } of PROVIDERS) {
					const st = statuses[id];
					if (st?.busy && !pollers.current[id]) {
						pollers.current[id] = setInterval(() => { void refresh(); }, 2000);
					}
					if (st && !st.busy && pollers.current[id]) {
						clearInterval(pollers.current[id]);
						delete pollers.current[id];
					}
				}
			}, [statuses, refresh]);

			async function login(provider) {
				try {
					setErrors((e) => { const n = { ...e }; delete n[provider]; return n; });
					const value = await rpcCall(props.rpc, "login", { provider });
					if (typeof value?.authorizeUrl === "string" && value.authorizeUrl) window.open(value.authorizeUrl, "_blank", "noopener");
					await refresh();
					if (!pollers.current[provider]) pollers.current[provider] = setInterval(() => { void refresh(); }, 1500);
					setTimeout(() => {
						if (pollers.current[provider]) { clearInterval(pollers.current[provider]); delete pollers.current[provider]; }
					}, 180000);
				} catch (error) {
					setErrors((e) => ({ ...e, [provider]: error instanceof Error ? error.message : String(error) }));
				}
			}
			async function logout(provider) {
				try {
					await rpcCall(props.rpc, "logout", { provider });
					await refresh();
				} catch (error) {
					setErrors((e) => ({ ...e, [provider]: error instanceof Error ? error.message : String(error) }));
				}
			}

			const container = { maxWidth: 640, display: "flex", flexDirection: "column", gap: 14, padding: 8 };
			const cardBase = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--dsw-alias-border-l1)", background: "var(--dsw-alias-bg-container)" };
			const btnBase = { height: 30, padding: "0 14px", borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-interactive-bg)", cursor: "pointer", fontSize: 12 };
			const metaBase = { color: "var(--dsw-alias-label-secondary)", fontSize: 12, lineHeight: "18px" };

			return jsxs("div", { style: container, children: [
				jsx("div", { style: { fontSize: 15, fontWeight: 650 }, children: "订阅中心" }),
				jsx("div", { style: metaBase, children: "用已有订阅登录，不需要 API Key；登录后模型选择器会出现对应模型。" }),
				loading ? jsx("div", { style: metaBase, children: "查询登录状态…" }) : null,
				errors._global ? jsx("div", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: 12 }, children: errors._global }) : null,
				jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: PROVIDERS.map((p) => {
					const st = statuses[p.id] || {};
					const isLogged = st.loggedIn === true;
					const isBusy = st.busy === true;
					const err = errors[p.id];
					const statusText = isBusy ? "登录中…" : (isLogged ? (st.account || "已登录") : "未登录");
					return jsxs("div", { key: p.id, style: cardBase, children: [
						jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [
							jsx("span", { style: { fontWeight: 600 }, children: p.name }),
							jsx("span", { style: metaBase, children: statusText })
						] }),
						jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
							err ? jsx("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, title: err, children: err }) : null,
							jsx("button", { type: "button", style: btnBase, disabled: isBusy, onClick: () => { if (isLogged) void logout(p.id); else void login(p.id); }, children: isBusy ? "处理中" : (isLogged ? "退出登录" : "登录") })
						] })
					] });
				}) })
			] });
		}

		const inject = ["slots", "connection"];
		function apply(ctx) {
			const connection = ctx.get("connection");
			if (!connection) return;
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "subs-hub",
				order: 88,
				label: () => "订阅中心",
				inject: () => ({ rpc: connection.rpc })
			}, SubscriptionsSection));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});