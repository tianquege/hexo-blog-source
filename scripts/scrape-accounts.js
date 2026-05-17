const fs = require('fs');
const path = require('path');
const https = require('https');

// 通用的 GET 请求封装 (替代 Puppeteer)
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 抓取 appi.lol (纯净 JSON 接口)
async function fetchAppiAccounts() {
  const accounts = [];
  try {
    console.log('正在抓取 appi.lol ...');
    const json = await fetchJSON('https://api.appi.lol/appid');
    if (json.code === 200 && Array.isArray(json.appidList)) {
      let count = 1;
      for (const item of json.appidList) {
        // 格式化数据，去除不需要的文字修饰
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
    console.log(`成功从 appi.lol 提取到 ${accounts.length} 个账号`);
  } catch (err) {
    console.error('抓取 appi.lol 失败:', err.message);
  }
  return accounts;
}

// 抓取 trumpyun1.com (源码正则表达式提取，无视弹窗)
async function fetchTrumpyunAccounts() {
  const accounts = [];
  try {
    console.log('正在抓取 trumpyun1.com ...');
    const html = await fetchText('https://trumpyun1.com/');
    
    // 从源码中直接用正则提取被隐藏的真实账号和密码
    const emailMatches = [...html.matchAll(/id="email-updated-\d+" data-original="([^"]+)"/g)].map(m => m[1]);
    const passMatches = [...html.matchAll(/id="password-updated-\d+" data-original="([^"]+)"/g)].map(m => m[1]);
    const timeMatches = [...html.matchAll(/<i class="fas fa-clock"><\/i>\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g)].map(m => m[1]);
    
    // 假设网页生成的顺序是对应的，直接按索引匹配
    const maxLen = Math.min(emailMatches.length, passMatches.length);
    for (let i = 0; i < maxLen; i++) {
      let timeStr = timeMatches[i] || new Date().toISOString().split('T')[0];
      accounts.push({
        number: `TY-${i + 1}`,
        email: emailMatches[i],
        password: passMatches[i],
        country: '未知(TY)', 
        status: '正常',
        time: timeStr
      });
    }
    console.log(`成功从 trumpyun1.com 提取到 ${accounts.length} 个账号`);
  } catch (err) {
    console.error('抓取 trumpyun1.com 失败:', err.message);
  }
  return accounts;
}

async function scrapeAccounts() {
  console.log('开始执行双源高速抓取...');

  let allAccounts = [];
  try {
    // 并发抓取两个网站
    const [appiAccounts, trumpyunAccounts] = await Promise.all([
      fetchAppiAccounts(),
      fetchTrumpyunAccounts()
    ]);

    allAccounts = [...trumpyunAccounts, ...appiAccounts];

    if (allAccounts.length === 0) {
      throw new Error('未能从任何源抓取到账号数据');
    }

    // 生成 Markdown 表格
    const markdown = generateMarkdownTable(allAccounts, '通过原生 Node 请求接口获取，无需日志调试。');
    updateArticleFile(markdown);

    console.log(`账号信息更新完成！共写入 ${allAccounts.length} 个账号`);

  } catch (error) {
    console.error('抓取过程中出错:', error);

    // 即使出错，也要更新文件，把错误信息显示出来
    const errorAccounts = [{
      number: '错误',
      email: '抓取失败',
      password: '请查看调试信息',
      country: 'Unknown',
      status: 'Error',
      time: new Date().toISOString().split('T')[0]
    }];
    const errorDebug = `脚本执行出错: ${error.message}\nStack: ${error.stack}`;

    const markdown = generateMarkdownTable(errorAccounts, errorDebug);
    updateArticleFile(markdown);
  }
}

function generateMarkdownTable(accounts, debugText) {
  // 获取北京时间
  const now = new Date();
  const timeString = now.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  let markdown = `## 共享账号信息\n\n**更新时间：** ${timeString}\n\n| 编号 | 邮箱 | 密码 | 国家 | 状态 | 时间 | 操作 |\n| ------| ------| ------| ------| ------| ------| ------|\n`;

  if (accounts.length === 0) {
    markdown += `| 暂无 | 获取失败 | 请参考 | 下方 | 调试 | 信息 | - |\n`;
  }

  accounts.forEach(account => {
    const copyEmailButton = `<a href="javascript:void(0)" onclick="copyEmail('${account.email}')" style="background: #007bff; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block; margin-right: 5px;">复制邮箱</a>`;
    const copyPasswordButton = `<a href="javascript:void(0)" onclick="copyPassword('${account.password}')" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block;">复制密码</a>`;
    markdown += `| ${account.number} | ${account.email} | ${account.password} | ${account.country} | ${account.status} | ${account.time} | ${copyEmailButton}${copyPasswordButton} |\n`;
  });

  markdown += `\n**注意：**\n- 共享ID，可能随时被盗，强烈建议购买独享ID\n- 严格禁止在手机设置中登录共享ID，防止意外ID锁死和手机变砖\n- 本信息仅供参考，使用风险自负\n\n<details>\n<summary>此处点击查看抓取调试信息（如表格为空请查看这里）</summary>\n<pre>\n${debugText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}\n</pre>\n</details>\n\n<script>\nfunction copyEmail(email) {\n  const text = email;\n  if (navigator.clipboard && window.isSecureContext) {\n    navigator.clipboard.writeText(text).then(() => {\n      alert('邮箱已复制到剪贴板！');\n    }).catch(err => {\n      console.error('复制失败:', err);\n      fallbackCopyTextToClipboard(text);\n    });\n  } else {\n    fallbackCopyTextToClipboard(text);\n  }\n}\n\nfunction copyPassword(password) {\n  const text = password;\n  if (navigator.clipboard && window.isSecureContext) {\n    navigator.clipboard.writeText(text).then(() => {\n      alert('密码已复制到剪贴板！');\n    }).catch(err => {\n      console.error('复制失败:', err);\n      fallbackCopyTextToClipboard(text);\n    });\n  } else {\n    fallbackCopyTextToClipboard(text);\n  }\n}\n\nfunction fallbackCopyTextToClipboard(text) {\n  const textArea = document.createElement("textarea");\n  textArea.value = text;\n  textArea.style.top = "0";\n  textArea.style.left = "0";\n  textArea.style.position = "fixed";\n  document.body.appendChild(textArea);\n  textArea.focus();\n  textArea.select();\n  \n  try {\n    const successful = document.execCommand('copy');\n    if (successful) {\n      alert('复制成功！');\n    } else {\n      alert('复制失败，请手动复制');\n    }\n  } catch (err) {\n    console.error('复制失败:', err);\n    alert('复制失败，请手动复制');\n  }\n  \n  document.body.removeChild(textArea);\n}\n</script>\n\n---\n*本页面由 GitHub Actions 自动更新*\n`;

  return markdown;
}

function updateArticleFile(markdown) {
  // 查找现有的 iOS 文章
  const postsDir = path.join(__dirname, '../source/_posts');
  const files = fs.readdirSync(postsDir);

  // 查找包含 "ios" 的文件
  const iosFile = files.find(file => file.toLowerCase().includes('ios') && file.endsWith('.md'));

  if (!iosFile) {
    console.log('未找到 iOS 文章文件');
    return;
  }

  const articlePath = path.join(postsDir, iosFile);
  const content = fs.readFileSync(articlePath, 'utf8');

  // 查找账号信息部分并替换
  const accountSectionRegex = /## 共享账号信息[\s\S]*?(?=##|$)/;
  const newAccountSection = markdown;

  let newContent;
  if (accountSectionRegex.test(content)) {
    // 如果已存在账号信息部分，替换它
    newContent = content.replace(accountSectionRegex, newAccountSection);
  } else {
    // 如果不存在，在文章开头添加（在第一个 ## 标题之前）
    const firstHeadingIndex = content.indexOf('##');
    if (firstHeadingIndex !== -1) {
      newContent = content.substring(0, firstHeadingIndex) + newAccountSection + '\n\n' + content.substring(firstHeadingIndex);
    } else {
      // 如果没有找到标题，在文章开头添加
      newContent = newAccountSection + '\n\n' + content;
    }
  }

  try {
    fs.writeFileSync(articlePath, newContent, 'utf8');
    console.log(`iOS 文章 ${iosFile} 更新成功`);
  } catch (error) {
    console.error('写入文件时出错:', error);
  }
}

// 仅当直接运行脚本时才执行，被 Hexo 加载时不执行
if (require.main === module) {
  scrapeAccounts().catch(console.error);
}
