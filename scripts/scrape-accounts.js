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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 抓取账号信息
    const accounts = await page.evaluate(() => {
      console.log('开始抓取页面内容...');
      
      // 获取页面HTML用于调试
      const pageHTML = document.body.innerHTML;
      console.log('页面HTML长度:', pageHTML.length);
      
      // 尝试多种选择器
      const selectors = [
        '.card', '[class*="card"]', '[class*="account"]', 
        '.account-card', '.account-item', '.item',
        'div[style*="border"]', 'div[style*="background"]',
        'section', 'article', '.container > div'
      ];
      
      let accountCards = [];
      for (const selector of selectors) {
        const cards = document.querySelectorAll(selector);
        console.log(`选择器 "${selector}" 找到 ${cards.length} 个元素`);
        if (cards.length > 0) {
          accountCards = Array.from(cards);
          break;
        }
      }
      
      // 如果还是没找到，尝试查找包含特定文本的元素
      if (accountCards.length === 0) {
        const allDivs = document.querySelectorAll('div');
        accountCards = Array.from(allDivs).filter(div => {
          const text = div.textContent || '';
          return text.includes('编号') || text.includes('@') || text.includes('密码');
        });
        console.log(`通过文本内容找到 ${accountCards.length} 个可能的元素`);
      }
      
      const accounts = [];
      
      accountCards.forEach((card, index) => {
        try {
          console.log(`处理第 ${index + 1} 个元素:`, card.textContent?.substring(0, 100));
          
          // 获取元素的所有文本内容
          const cardText = card.textContent || '';
          
                     // 使用正则表达式提取信息
           const numberMatch = cardText.match(/编号\s*(\d+)/);
           const emailMatch = cardText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
           
           // 更精确的正则表达式，确保只匹配到下一个字段之前的内容
           const passwordMatch = cardText.match(/密码[：:]\s*([^国家]+?)(?=\s*国家[：:])/);
           const countryMatch = cardText.match(/国家[：:]\s*([^状态]+?)(?=\s*状态[：:])/);
           const statusMatch = cardText.match(/状态[：:]\s*([^时间]+?)(?=\s*\d{4}-\d{2}-\d{2})/);
           const timeMatch = cardText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
           
           // 清理字段，移除多余的空格和换行
           const cleanPassword = passwordMatch ? passwordMatch[1].trim() : '';
           const cleanCountry = countryMatch ? countryMatch[1].trim() : '';
           const cleanStatus = statusMatch ? statusMatch[1].trim() : '';
          
                     const number = numberMatch ? `编号${numberMatch[1]}` : `编号${index + 1}`;
           const email = emailMatch ? emailMatch[1] : '';
           const password = cleanPassword;
           const country = cleanCountry;
           const status = cleanStatus;
           const time = timeMatch ? timeMatch[1] : '';
          
          if (email || password) {
            accounts.push({
              number,
              email,
              password,
              country,
              status,
              time
            });
            console.log(`成功提取账号 ${number}:`, { email, password, country, status, time });
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

| 编号 | 邮箱 | 密码 | 国家 | 状态 | 时间 | 操作 |
|------|------|------|------|------|------|------|
`;

  accounts.forEach(account => {
    const copyButton = `<button onclick="copyAccount('${account.email}', '${account.password}')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">复制账号</button>`;
    markdown += `| ${account.number} | ${account.email} | ${account.password} | ${account.country} | ${account.status} | ${account.time} | ${copyButton} |\n`;
  });
  
  markdown += `
**注意：** 
- 共享ID，可能随时被盗，强烈建议购买独享ID
- 严格禁止在手机设置中登录共享ID，防止意外ID锁死和手机变砖
- 本信息仅供参考，使用风险自负

<script>
function copyAccount(email, password) {
  const text = \`邮箱: \${email}\\n密码: \${password}\`;
  
  if (navigator.clipboard && window.isSecureContext) {
    // 使用现代 Clipboard API
    navigator.clipboard.writeText(text).then(() => {
      alert('账号信息已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // 降级方案
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
      alert('账号信息已复制到剪贴板！');
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

// 运行脚本
scrapeAccounts().catch(console.error);
