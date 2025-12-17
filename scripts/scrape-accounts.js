const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 从本地文件中读取上次的檢查时间
function getLastCheckTime() {
  try {
    const postsDir = path.join(__dirname, '../source/_posts');
    const files = fs.readdirSync(postsDir);
    const iosFile = files.find(file => file.toLowerCase().includes('ios') && file.endsWith('.md'));
    if (!iosFile) return null;

    const content = fs.readFileSync(path.join(postsDir, iosFile), 'utf8');
    // 在表格里找时间（假设时间格式是 YYYY-MM-DD HH:mm:ss）
    const match = content.match(/\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\|/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

async function scrapeAccounts() {
  console.log('开始抓取账号信息...');

  let browser;
  try {
    // 自动检测系统 Chrome 路径（针对 GitHub Actions 环境）
    let executablePath = null;
    if (process.platform === 'linux') {
      const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser'
      ];
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          executablePath = p;
          console.log(`在 Linux 环境下找到 Chrome: ${p}`);
          break;
        }
      }
    }

    const launchOptions = {
      headless: "new", // 使用新版 Headless 模式
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // 隐藏 WebDriver 特征，绕过简单的反爬虫检测
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    // 设置额外的HTTP头
    await page.setExtraHTTPHeaders({
      'Referer': 'https://www.google.com/',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    });
    // 禁用缓存，防止抓取到旧数据
    await page.setCacheEnabled(false);

    // 获取本地上次更新时间
    const lastCheckTime = getLastCheckTime();
    console.log(`本地记录的上次检查时间: ${lastCheckTime || '无'}`);

    // 重试循环
    let accounts = [];
    let pageText = '';
    const maxRetries = 10; // 最多重试10次（约10分钟）

    for (let i = 0; i < maxRetries; i++) {
      console.log(`第 ${i + 1} 次尝试侦测上游更新...`);

      try {
        // 添加随机参数防止缓存
        const targetUrl = `https://free.iosapp.icu/?t=${new Date().getTime()}`;
        console.log(`正在访问: ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      } catch (err) {
        console.log('页面加载超时或失败，尝试继续解析...');
      }

      await new Promise(r => setTimeout(r, 10000)); // 等待渲染

      const fullText = await page.evaluate(() => document.body.innerText);
      pageText = fullText.substring(0, 800) + '...'; // Debug用

      // 提取网页上的"检查时间"（寻找最新的那个）
      // 格式：检查时间: 2025-12-17 23:03:58
      const timeMatches = fullText.match(/检查时间[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g);
      let currentCheckTime = null;
      if (timeMatches && timeMatches.length > 0) {
        // 假设第一个找到的时间就是最新的（通常由上而下）
        const tm = timeMatches[0].match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        if (tm) currentCheckTime = tm[1];
      }

      console.log(`网页上的最新检查时间: ${currentCheckTime || '未找到'} (本地记录: ${lastCheckTime || '无'})`);

      // 如果未能获取到时间（可能是反爬虫拦截，或页面加载不全）
      if (!currentCheckTime) {
        console.log('警告：未能从页面提取到检查时间，可能是被拦截或页面结构异常。等待 10 秒后重试...');
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }

      // 核心逻辑：
      // 1. 如果是手动触发 (workflow_dispatch)，强制抓取。
      // 2. 如果没有本地记录（第一次运行），直接抓。
      // 3. 如果网页时间 > 本地时间（有更新），直接抓。
      // 4. 如果网页时间 == 本地时间（没更新），等待并重试。

      const isManualTrigger = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';

      if (isManualTrigger || !lastCheckTime || (currentCheckTime && currentCheckTime !== lastCheckTime)) {
        if (isManualTrigger) console.log('检测到手动触发，强制抓取更新！');
        else console.log('发现上游新数据（或无本地记录），准备开始抓取！');
        // 继续向下执行解析逻辑
      } else {
        // 如果走到这里，说明 currentCheckTime === lastCheckTime 且 非手动触发
        if (i < maxRetries - 1) {
          console.log(`上游数据尚未更新，等待 60 秒后重试... (${i + 1}/${maxRetries})`);
          await new Promise(r => setTimeout(r, 60000));
          // 重载页面，进入下一次循环
          continue;
        } else {
          console.log('重试次数耗尽，上游长时间未更新。本次任务终止，不更新博客。');
          return;
        }
      }

      // 如果循环结束前 return 了，下面不会执行。
      // 如果 break 了，下面继续执行解析。



      // 开始解析账号
      accounts = [];
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

      let match;
      let count = 1;

      while ((match = emailRegex.exec(fullText)) !== null) {
        const email = match[1];
        const startIndex = match.index;
        const context = fullText.substring(startIndex, startIndex + 200);
        const preContext = fullText.substring(Math.max(0, startIndex - 100), startIndex);

        if (!preContext.includes('编号') && !context.substring(0, 50).includes('编号')) continue;

        const passMatch = context.match(/密码[：:]\s*([^\s\r\n]+)/);

        // 提取该账号的具体检查时间
        const accountTimeMatch = context.match(/检查时间[：:]\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const accountTime = accountTimeMatch ? accountTimeMatch[1] : (currentCheckTime || new Date().toISOString().split('T')[0]);

        let country = '未知';
        if (passMatch) {
          const betweenText = context.substring(match[0].length, passMatch.index).trim();
          const countryMatch = betweenText.match(/[\u4e00-\u9fa5]+/);
          if (countryMatch) country = countryMatch[0];
        }

        if (passMatch) {
          let cleanPassword = passMatch[1].trim();
          const suffixesToRemove = ['检查时间', '国家', '状态', '时间'];
          for (const suffix of suffixesToRemove) {
            if (cleanPassword.includes(suffix)) cleanPassword = cleanPassword.split(suffix)[0].trim();
          }
          cleanPassword = cleanPassword.replace(/[：:]$/, '');

          accounts.push({
            number: `编号${count++}`,
            email: email,
            password: cleanPassword,
            country: country,
            status: '正常',
            time: accountTime
          });
          console.log(`找到账号: ${email} 时间: ${accountTime}`);
        }
      }

      // 如果找到了账号，就跳出
      if (accounts.length > 0) break;
    }

    // 生成 Markdown 表格
    const markdown = generateMarkdownTable(accounts, pageText);
    updateArticleFile(markdown);

    console.log('账号信息更新完成！');

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

  } finally {
    if (browser) await browser.close();
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

  let markdown = `## 共享账号信息

  ** 更新时间：** ${timeString}

| 编号 | 邮箱 | 密码 | 国家 | 状态 | 时间 | 操作 |
| ------| ------| ------| ------| ------| ------| ------|
  `;

  if (accounts.length === 0) {
    markdown += `\n | 暂无 | 获取失败 | 请参考 | 下方 | 调试 | 信息 | - |\n`;
  }

  accounts.forEach(account => {
    const copyEmailButton = `<a href="javascript:void(0)" onclick="copyEmail('${account.email}')" style="background: #007bff; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block; margin-right: 5px;">复制邮箱</a>`;
    const copyPasswordButton = `<a href="javascript:void(0)" onclick="copyPassword('${account.password}')" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block;">复制密码</a>`;
    markdown += `| ${account.number} | ${account.email} | ${account.password} | ${account.country} | ${account.status} | ${account.time} | ${copyEmailButton}${copyPasswordButton} |\n`;
  });

  markdown += `
  **注意：**
    - 共享ID，可能随时被盗，强烈建议购买独享ID
      - 严格禁止在手机设置中登录共享ID，防止意外ID锁死和手机变砖
        - 本信息仅供参考，使用风险自负

<details>
<summary>此处点击查看抓取调试信息（如表格为空请查看这里）</summary>
<pre>
${debugText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
</pre>
</details>

<script>
function copyEmail(email) {
  const text = email;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert('邮箱已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function copyPassword(password) {
  const text = password;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert('密码已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('复制成功！');
    } else {
      alert('复制失败，请手动复制');
    }
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  }
  
  document.body.removeChild(textArea);
}
</script>

---
*本页面由 GitHub Actions 自动更新*
`;

  return markdown;
}

function updateArticleFile(markdown) {
  // 查找现有的 iOS 文章
  const postsDir = path.join(__dirname, '../source/_posts');
  const files = fs.readdirSync(postsDir);

  // 查找包含 "ios" 的文件
  const iosFile = files.find(file =>
    file.toLowerCase().includes('ios') && file.endsWith('.md')
  );

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
