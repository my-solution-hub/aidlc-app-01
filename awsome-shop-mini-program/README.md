# awsome-shop-mini-program

WeChat Mini Program (微信小程序) client for **AWSome Shop** — a sibling to
`awsome-shop-frontend` (web React) and `awsome-shop-android` (Android native).

It mirrors the **employee-facing** features of the web frontend:
积分商城 / 商品详情 / 兑换 / 兑换记录 / 积分中心.

Tracks parity with `awsome-shop-frontend` v1.2: confirm-receipt, address book,
multi-image gallery, color/quantity selectors, related products, reviews,
wishlist, hero status card + horizontal progress on order detail, and the
gateway-prefixed product image URL helper.

## Tech stack

| Concern        | Choice                                    |
|----------------|-------------------------------------------|
| Framework      | Native WeChat Mini Program (no build step)|
| Library version| `3.4.0` (set in `project.config.json`)    |
| Languages      | WXML / WXSS / JS                          |
| Networking     | `wx.request` wrapper (`utils/request.js`) |
| State          | `wx.getStorageSync` / globalData          |
| Backend        | Same gateway as web (`/auth/...`, `/product/...`, `/order/...`, `/point/...`) |

## Project layout

```
awsome-shop-mini-program/
├── app.js                  # globals, requireAuth helper
├── app.json                # routes, tabBar, window
├── app.wxss                # global tokens (colors mirror web theme)
├── project.config.json     # WeChat dev tools project config
├── sitemap.json
├── utils/
│   ├── auth.js             # token / user storage
│   ├── config.js           # apiBaseUrl
│   ├── request.js          # axios-equivalent: token, Result unwrap, 401 redirect, BusinessError
│   ├── format.js           # number / date formatting
│   └── orderStatus.js      # status & category color mappings (mirrors web utils/orderStatus.ts)
├── services/               # API modules — 1:1 with awsome-shop-frontend/src/services/api/
│   ├── auth.js
│   ├── product.js          # incl. getRelatedProducts / listReviews / createReview
│   ├── category.js
│   ├── point.js
│   ├── order.js            # incl. confirmReceipt
│   ├── wishlist.js         # C6
│   └── address.js          # C1
└── pages/
    ├── login/              # Username/password login (mirror frontend Login)
    ├── register/           # Register new account
    ├── shop-home/          # Tab — hero + categories + product grid (infinite scroll)
    ├── product-detail/     # Product page with redeem CTA
    ├── confirm-redemption/ # Cost / balance summary, confirm
    ├── redemption-success/ # Success card
    ├── my-orders/          # Tab — orders list with status tabs + keyword filter
    ├── order-detail/       # Order detail with status timeline
    └── my-points/          # Tab — points hero, quick links, earn rules, transactions, logout
```

## Running locally

1. Install **微信开发者工具** (WeChat DevTools).
2. Start the backend gateway and services (see root `README.md` /
   `docker-compose.yml`). The gateway should expose:
   - `POST /auth/api/auth/login`
   - `POST /auth/api/auth/register`
   - `GET  /product/api/products`, `/product/api/products/:id`
   - `GET  /product/api/categories/tree`
   - `GET  /point/api/points/balance`, `/point/api/points/transactions`
   - `POST /order/api/orders`, `GET /order/api/orders`, `GET /order/api/orders/:id`
3. `utils/config.js` defaults to the deployed CloudFront distribution
   `https://d2ujuxmg0mw1kh.cloudfront.net` (per `docs/operation-guide.md`).
   For local dev against the docker-compose gateway, change it to
   `http://localhost:8088`.
4. In WeChat DevTools click **导入项目**, point to this folder, and choose
   **测试号** for AppID (no real AppID required during local dev).
5. In **详情 → 本地设置**, tick *不校验合法域名* so `wx.request` works against
   `localhost`. For production builds, register the API domain in 微信公众平台.

## Test accounts

- `employee` / `employee123` (员工)

Admin pages are intentionally not implemented in the mini-program — admin
flows are awkward on mobile and are kept on the web frontend only.

## Design parity with the web frontend

The mini-program reproduces the web theme tokens (`#2563EB` primary, slate
neutrals, gradient hero), page hierarchy, and component patterns —
adapted to mobile (rpx units, single-column grids, tabBar navigation
instead of a desktop sidebar).

## Pending work

- **Tab icons**: `app.json` ships without `iconPath` / `selectedIconPath`. To
  enable icons, drop two PNGs per tab (e.g. `images/tab-shop.png` +
  `images/tab-shop-active.png`, 81×81) and add the paths back to the tabBar
  list. WeChat refuses to build with non-existent icon paths, which is why
  they're omitted by default.
- **i18n**: zh-CN only for v1. The web frontend supports en/zh; the
  mini-program can be wired to `i18next` later if needed.
- **WeChat-native login**: deferred — current implementation uses the same
  username/password endpoint as the web. To add `wx.login` /
  `jscode2session`, register a real AppID and add a backend exchange
  endpoint.
