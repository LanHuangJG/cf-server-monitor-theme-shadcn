#!/usr/bin/env python3
"""拉取爱发电赞助者，生成 SPONSORS.md（供 GitHub Actions 定时运行）。

环境变量：
  AFDIAN_USERID  爱发电 user_id（开发者后台）
  AFDIAN_TOKEN   爱发电 API Token（开发者后台）
凭证缺失时直接跳过（不报错），便于未配置时不刷失败。
"""
import hashlib
import json
import os
import sys
import time
import urllib.request

API = "https://afdian.com/api/open/query-sponsor"
USERID = os.environ.get("AFDIAN_USERID", "").strip()
TOKEN = os.environ.get("AFDIAN_TOKEN", "").strip()
OUT = os.path.join(os.path.dirname(__file__), "..", "SPONSORS.md")


def md5(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def query_sponsors(page: int) -> dict:
    params = json.dumps({"page": page}, separators=(",", ":"))
    ts = int(time.time())
    sign = md5(f"{TOKEN}params{params}ts{ts}user_id{USERID}")
    body = json.dumps(
        {"user_id": USERID, "params": params, "ts": ts, "sign": sign}
    ).encode("utf-8")
    req = urllib.request.Request(
        API, data=body, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def fetch_all() -> list:
    sponsors = []
    page = 1
    while True:
        data = query_sponsors(page)
        if data.get("ec") != 200:
            raise SystemExit(f"API error: ec={data.get('ec')} em={data.get('em')}")
        body = data.get("data") or {}
        for item in body.get("list") or []:
            user = item.get("user") or {}
            name = (user.get("name") or "").strip() or "匿名"
            uid = user.get("user_id") or ""
            avatar = user.get("avatar") or ""
            amount = float(item.get("all_sum_amount") or 0)
            sponsors.append(
                {"name": name, "uid": uid, "avatar": avatar, "amount": amount}
            )
        total_page = int(body.get("total_page") or 1)
        if page >= total_page:
            break
        page += 1
    # 按 user_id 去重，保留金额最高的一条
    best = {}
    for s in sponsors:
        key = s["uid"] or s["name"]
        if key not in best or s["amount"] > best[key]["amount"]:
            best[key] = s
    return sorted(best.values(), key=lambda s: s["amount"], reverse=True)


def render(sponsors: list) -> str:
    today = time.strftime("%Y-%m-%d", time.gmtime())
    lines = [
        "# 赞助者",
        "",
        "感谢通过 [爱发电](https://afdian.com/a/wenjings) 支持本项目的朋友（按支持金额排序）：",
        "",
        "<!-- 本文件由 scripts/fetch-sponsors.py 自动生成，请勿手动编辑 -->",
        "",
    ]
    if sponsors:
        avatars = []
        for s in sponsors:
            if s["avatar"]:
                avatars.append(
                    f'<a href="https://afdian.com/u/{s["uid"]}" target="_blank" '
                    f'title="{s["name"]}"><img src="{s["avatar"]}" width="48" '
                    f'height="48" alt="{s["name"]}"></a>'
                )
            else:
                avatars.append(f"`{s['name']}`")
        lines.append(" ".join(avatars))
        lines.append("")
        lines.append(f"<sub>共 {len(sponsors)} 位 · 更新于 {today}</sub>")
    else:
        lines.append("还没有赞助者，欢迎成为第一个～")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    if not USERID or not TOKEN:
        print("AFDIAN_USERID / AFDIAN_TOKEN 未配置，跳过。", file=sys.stderr)
        return 0
    sponsors = fetch_all()
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(render(sponsors))
    print(f"更新完成：{len(sponsors)} 位赞助者")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
