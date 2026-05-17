export default {
  async fetch(request, env, ctx) {
    // 1. 抓取 appi.lol 账号
    async function fetchAppiAccounts() {
      const accounts = [];
      try {
        const response = await fetch('https://api.appi.lol/appid', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
        });
        const json = await response.json();
        if (json.code === 200 && Array.isArray(json.appidList)) {
          let count = 1;
          for (const item of json.appidList) {
            let timeStr = item.time ? item.time.replace(/.*?检测时间[：:]?\s*/, '').trim() : '';
            let statusStr = item.status ? item.status.replace(/.*?账号状态[：:]?\s*/, '').trim() : '正常';
            accounts.push({
              number: `APPI-${count++}`,
              email: item.user,
              password: item.pass,
              country: '美区(APPI)',
              status: statusStr,
              time: timeStr
            });
          }
        }
      } catch (e) {
        console.error('APPI fetch error', e);
      }
      return accounts;
    }

    // 2. 抓取 trumpyun1.com 账号
    async function fetchTrumpyunAccounts() {
      const accounts = [];
      try {
        const response = await fetch('https://trumpyun1.com/', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await response.text();
        
        // 正则提取被隐藏的账号和密码
        const emailMatches = [...html.matchAll(/id="email-updated-\d+" data-original="([^"]+)"/g)].map(m => m[1]);
        const passMatches = [...html.matchAll(/id="password-updated-\d+" data-original="([^"]+)"/g)].map(m => m[1]);
        const timeMatches = [...html.matchAll(/<i class="fas fa-clock"><\/i>\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g)].map(m => m[1]);
        
        const maxLen = Math.min(emailMatches.length, passMatches.length);
        for (let i = 0; i < maxLen; i++) {
          accounts.push({
            number: `TY-${i + 1}`,
            email: emailMatches[i],
            password: passMatches[i],
            country: '未知(TY)', 
            status: '正常',
            time: timeMatches[i] || new Date().toISOString().split('T')[0]
          });
        }
      } catch (e) {
        console.error('Trumpyun fetch error', e);
      }
      return accounts;
    }

    // 3. 并发光速抓取两个源
    const [appiAccounts, trumpyunAccounts] = await Promise.all([
      fetchAppiAccounts(),
      fetchTrumpyunAccounts()
    ]);
    const allAccounts = [...trumpyunAccounts, ...appiAccounts];

    // 4. 将抓取到的数据渲染成优美的 HTML 网页
    const htmlContent = generateHTML(allAccounts);

    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  }
};

// ================= 前端网页 UI 生成器 =================
function generateHTML(accounts) {
  // 获取服务器当前时间
  const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  // 生成无数据时的提示
  let tableBody = '';
  if (accounts.length === 0) {
    tableBody = `<tr><td colspan="6" style="text-align:center; padding:30px;">上游源暂时无法访问或无数据更新，请稍后再试。</td></tr>`;
  } else {
    tableBody = accounts.map(acc => `
      <tr>
        <td><strong>${acc.number}</strong></td>
        <td style="color:#0056b3;">${acc.email}</td>
        <td>${acc.country}</td>
        <td><span style="color: #28a745; font-weight:bold;">${acc.status}</span></td>
        <td>${acc.time}</td>
        <td>
          <button class="btn btn-blue" onclick="copyText('${acc.email}')">复制邮箱</button>
          <button class="btn btn-green" onclick="copyText('${acc.password}')">复制密码</button>
        </td>
      </tr>
    `).join('');
  }

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>极速 - 免费小火箭共享账号</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; background-color: #f4f7f6; padding: 20px; color: #333; margin: 0; }
        .container { max-width: 1000px; margin: 0 auto; background: #fff; padding: 20px 30px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
        h1 { text-align: center; color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; font-size: 14px; margin-bottom: 25px; }
        .notice { background: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 6px solid #ffeeba; font-size: 14px; line-height: 1.5; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        th { background-color: #f8f9fa; font-weight: 600; color: #444; white-space: nowrap; }
        tr:hover { background-color: #f9fbfd; transition: background 0.3s; }
        .btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; color: #fff; font-size: 12px; margin-right: 5px; transition: opacity 0.2s; white-space: nowrap; }
        .btn-blue { background: #007bff; }
        .btn-green { background: #28a745; }
        .btn:hover { opacity: 0.8; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        
        @media (max-width: 768px) {
          .container { padding: 15px; }
          h1 { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 全网聚合 · 免费小火箭共享账号池</h1>
        <div class="subtitle">页面每次刷新，后台都会以毫秒级速度为您从各大数据源实时拉取最新可用账号。</div>
        
        <div class="notice">
          <strong>⚠️ 安全警告（必读）：</strong><br>
          1. 严禁在手机系统的【设置-iCloud】中登录此类共享账号，极易导致锁机变砖！<br>
          2. <strong>请仅在【App Store】应用商店内登录下载。</strong><br>
          3. 本页面为公益聚合接口，账号资源容易被官方封锁，如提示密码错误请更换其他账号。
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 14px; color: #555;">当前聚合总数：<strong style="color: #e74c3c; font-size: 18px;">${accounts.length}</strong> 个有效账号</span>
          <span style="font-size: 12px; color: #888;">本次拉取时间：${now}</span>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>编号</th>
                <th>账号(邮箱)</th>
                <th>来源/国家</th>
                <th>状态</th>
                <th>上游更新时间</th>
                <th>快捷操作</th>
              </tr>
            </thead>
            <tbody>
              ${tableBody}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          * 本页面由 Cloudflare Workers 强力驱动，提供全天候 0 延迟实时信息聚合。
        </div>
      </div>

      <script>
        function copyText(text) {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
              alert('✅ 成功复制到剪贴板：\\n' + text);
            }).catch(err => {
              alert('❌ 复制失败，请手动选择文字复制');
            });
          } else {
            // 兼容性备用方案
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
              document.execCommand('copy');
              alert('✅ 成功复制到剪贴板：\\n' + text);
            } catch (err) {
              alert('❌ 复制失败，请手动选择文字复制');
            }
            textArea.remove();
          }
        }
      </script>
    </body>
    </html>
  `;
}
