// API base URL. Points to the deployed CloudFront distribution by default
// (matches docs/operation-guide.md). For local dev against the docker-compose
// gateway, swap to 'http://localhost:8088'.
//
// Note: WeChat 开发者工具 by default refuses non-allowlisted hosts. Either
// (a) for local dev: 详情 → 本地设置 → ☑ 不校验合法域名/...证书; or
// (b) for release: register this domain in 微信公众平台 → 开发管理 → 服务器域名 (request合法域名).
const CONFIG = {
  apiBaseUrl: 'https://d2ujuxmg0mw1kh.cloudfront.net',
};

module.exports = { CONFIG };
