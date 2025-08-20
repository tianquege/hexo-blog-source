const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAccounts() {
  console.log('开始抓取账号信息...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // 访问网站
    await page.goto('https://free.iosapp.icu/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 抓取账号信息
    const accounts = await page.evaluate(() => {
      const accountCards = document.querySelectorAll('.card, [class*="card"], [class*="account"]');
      const accounts = [];
      
      accountCards.forEach((card, index) => {
        try {
          // 尝试不同的选择器来获取信息
          const number = card.querySelector('[class*="number"], [class*="id"], h3, h4')?.textContent?.trim() || `编号${index + 1}`;
          const email = card.querySelector('[class*="email"], [class*="mail"]')?.textContent?.trim() || '';
          const password = card.querySelector('[class*="password"], [class*="pwd"]')?.textContent?.trim() || '';
          const country = card.querySelector('[class*="country"], [class*="region"]')?.textContent?.trim() || '';
          const status = card.querySelector('[class*="status"], [class*="state"]')?.textContent?.trim() || '';
          const time = card.querySelector('[class*="time"], [class*="date"]')?.textContent?.trim() || '';
          
          if (email || password) {
            accounts.push({
              number,
              email,
              password,
              country,
              status,
              time
            });
          }
        } catch (error) {
          console.log(`解析卡片 ${index + 1} 时出错:`, error);
        }
      });
      
      return accounts;
    });
    
    console.log(`抓取到 ${accounts.length} 个账号信息`);
    
    // 生成 Markdown 表格
    const markdown = generateMarkdownTable(accounts);
    
    // 更新文章文件
    updateArticleFile(markdown);
    
    console.log('账号信息更新完成！');
    
  } catch (error) {
    console.error('抓取过程中出错:', error);
  } finally {
    await browser.close();
  }
}

function generateMarkdownTable(accounts) {
  let markdown = `## 共享账号信息

**更新时间：** ${new Date().toLocaleString('zh-CN')}

| 编号 | 邮箱 | 密码 | 国家 | 状态 | 时间 |
|------|------|------|------|------|------|
`;

  accounts.forEach(account => {
    markdown += `| ${account.number} | ${account.email} | ${account.password} | ${account.country} | ${account.status} | ${account.time} |\n`;
  });
  
  markdown += `
**注意：** 
- 共享ID，可能随时被盗，强烈建议购买独享ID
- 严格禁止在手机设置中登录共享ID，防止意外ID锁死和手机变砖
- 本信息仅供参考，使用风险自负

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
  const newAccountSection = markdown.split('---')[2]; // 去掉 front-matter
  
  let newContent;
  if (accountSectionRegex.test(content)) {
    // 如果已存在账号信息部分，替换它
    newContent = content.replace(accountSectionRegex, newAccountSection);
  } else {
    // 如果不存在，在文章末尾添加
    newContent = content + '\n\n' + newAccountSection;
  }
  
  try {
    fs.writeFileSync(articlePath, newContent, 'utf8');
    console.log(`iOS 文章 ${iosFile} 更新成功`);
  } catch (error) {
    console.error('写入文件时出错:', error);
  }
}

// 运行脚本
scrapeAccounts().catch(console.error);
