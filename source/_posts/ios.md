title: 苹果IOS系统使用教程👉进入获取小火箭共享账号
date: 2025-08-21 10:00:00
sticky: 3
categories: 
  - 账号获取
tags:
  - ios
  - 客户端
---

## 共享账号信息
  
**更新时间：** 2025/12/17 23:15:11

| 编号 | 邮箱 | 密码 | 国家 | 状态 | 时间 | 操作 |
|------|------|------|------|------|------|------|
| 错误 | 抓取失败 | 请查看调试信息 | Unknown | Error | 2025-12-17 | <a href="javascript:void(0)" onclick="copyEmail('抓取失败')" style="background: #007bff; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block; margin-right: 5px;">复制邮箱</a><a href="javascript:void(0)" onclick="copyPassword('请查看调试信息')" style="background: #28a745; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-block;">复制密码</a> |

**注意：** 
- 共享ID，可能随时被盗，强烈建议购买独享ID
- 严格禁止在手机设置中登录共享ID，防止意外ID锁死和手机变砖
- 本信息仅供参考，使用风险自负

<details>
<summary>此处点击查看抓取调试信息（如表格为空请查看这里）</summary>
<pre>
脚本执行出错: Could not find Chrome (ver. 143.0.7499.42). This can occur if either
 1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or
 2. your cache path is incorrectly configured (which is: /home/runner/.cache/puppeteer).
For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.
Stack: Error: Could not find Chrome (ver. 143.0.7499.42). This can occur if either
 1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`) or
 2. your cache path is incorrectly configured (which is: /home/runner/.cache/puppeteer).
For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.
    at ChromeLauncher.resolveExecutablePath (/home/runner/work/hexo-blog-source/hexo-blog-source/node_modules/.pnpm/puppeteer-core@24.33.0/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:333:27)
    at ChromeLauncher.computeLaunchArguments (/home/runner/work/hexo-blog-source/hexo-blog-source/node_modules/.pnpm/puppeteer-core@24.33.0/node_modules/puppeteer-core/lib/cjs/puppeteer/node/ChromeLauncher.js:94:24)
    at async ChromeLauncher.launch (/home/runner/work/hexo-blog-source/hexo-blog-source/node_modules/.pnpm/puppeteer-core@24.33.0/node_modules/puppeteer-core/lib/cjs/puppeteer/node/BrowserLauncher.js:85:28)
    at async scrapeAccounts (/home/runner/work/hexo-blog-source/hexo-blog-source/scripts/scrape-accounts.js:10:15)
</pre>
</details>

<script>
function copyEmail(email) {
  const text = email;
  
  if (navigator.clipboard && window.isSecureContext) {
    // 使用现代 Clipboard API
    navigator.clipboard.writeText(text).then(() => {
      alert('邮箱已复制到剪贴板！');
    }).catch(err => {
      console.error('复制失败:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // 降级方案
    fallbackCopyTextToClipboard(text);
  }
}

function copyPassword(password) {
  const text = password;
  
  if (navigator.clipboard && window.isSecureContext) {
    // 使用现代 Clipboard API
    navigator.clipboard.writeText(text).then(() => {
      alert('密码已复制到剪贴板！');
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
## 详细使用教程

### 使用方法

**⚠️ 重要提醒：手机设置的ID必须登录自己的，切记！如果你设置里没有登录自己的账号，在商店登录共享ID，会同步到你手机设置里，可能会被人恶意锁机诈骗。**

1. 在 iPhone 或 iPad 主屏幕上找到「App Store」软件打开，点击右上角「头像图标」，下滑到底部，点击「退出登录」现有账号。

2. 输入购买收到的账号，点击「登录」。如果出现「Apple ID 安全」提示，点击下方的「其他选项」，点击「不升级」继续登录。

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/7.jpg)

**PS:** 盗版软件较多，认准名字 **Shadowrocket**

---

## 小火箭APP添加订阅教程

### 一键订阅

1. 使用Safari浏览器登录你购买订阅的网站【没有订阅就去买，有的人傻呵呵的就真的打开浏览器就以为自动出现订阅了，你不买咋会有】进入个人中心，在仪表盘页面或我的订阅页面找到一键订阅按钮，点击并选择导入到Shadowrocket选项。点击后iOS系统会跳转到Shadowrocket客户端内并自动将节点订阅信息填好。

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/1.png)

2. 点击Shadowrocket，弹出提示点打开！

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/2.png)

3. 会自动打开小火箭并更新订阅

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/3.png)

4. 点击选中需要的节点，然后打开右上角的开关按钮

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/4.png)

5.点击右下角配置按钮，选择订阅点击进入

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/5.png)

6.打开自动更新订阅开关，至此全部设置完毕！下次重启小火箭，订阅将会自动更新最新节点

![](https://pyxy.126581.xyz/https://github.com/tianquege/hexo-blog-source/blob/master/source/_posts/ios/6.png)

7. 非必须要！！
    回到首页点击上方全局路由可以更改代理模式，其中：
   - **"配置"** 为配置文件代理（即按照规则自动分流）
   - **"代理"** 为全局代理（即所有连接均通过代理）
   - **"直连"** 为绕过代理（即所有连接均不通过代理）
   - **"场景"** 适用于不同网络环境下自动切换代理模式

点击首页右上方系统总开关即可开启代理服务。

---

### 方式二：手动订阅

1. 使用Safari浏览器登录进入个人中心，在仪表盘页面或我的订阅页面找到一键订阅按钮，点击并选择复制订阅地址选项。点击后会将订阅地址复制到iOS系统剪贴板中，以供下一步手动导入使用。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/113lf8n-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

2. 进入客户端首页，选择右上角 + 按键。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/113l3uk-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

3. 类型选择「Subscribe」，将第一步复制的订阅地址粘贴到URL栏中，在下方备注区域输入分组名称，最后点击右上角完成按钮保存。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/114vkht-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

4. 回到客户端首页，可以看到客户端已经自动下载好所有节点及相关信息。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/11140tl-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

5. 进入配置选项页，建议使用默认配置文件即可。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/10zi0t8-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

6. 进入设置选项页，按照下图将订阅设置项的"打开时更新"和"自动后台更新"选项同时开启。

<div style="text-align: center; margin: 20px 0;">
<img src="https://pic.ybfl.xyz/i/2023/02/22/10zhv4u-0.png" alt="一键订阅" style="max-width: 100%; height: auto;" />
</div>

7. 回到首页点击上方全局路由可以更改代理模式，其中：
   - **"配置"** 为配置文件代理（即按照规则自动分流）
   - **"代理"** 为全局代理（即所有连接均通过代理）
   - **"直连"** 为绕过代理（即所有连接均不通过代理）
   - **"场景"** 适用于不同网络环境下自动切换代理模式

**非高级用户推荐使用默认的"配置"模式进行自动分流。**

点击首页右上方系统总开关即可开启代理服务。
## 正文开始
<h2>下载免费Hiddify Proxy & VPN  </h2>
<p><a href="https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532"target="_blank"><button class="btn btn-hero-primary"><i class="far fa fa-share"></i>安装Hiddify Proxy & VPN</button></a></p>

# 下载 Shadowrocket
   <p><a href="https://apps.apple.com/ca/app/shadowrocket/id932747118"target="_blank"><button class="btn btn-hero-primary"><i class="far fa fa-share"></i>安装shadowrocket</button></a></p>
 （可以选择在线安装或者登陆美区苹果账号自行购买。因小火箭Shadowrocket在iOS国区里已经下架了，需要登录非国区ID才能下载，非常的麻烦。而且有些小白也会登录iCloud的，这样挺危险的，一定不要登陆iCloud，建议谷歌搜索一下小火箭商家，自行购买一个独享账号留自备用，以防不时之需）。

第一次连接时会弹出一个添加代理的提示框，点"Allow"允许，否则不能用。如果你有多个节点，连接后是使用前面有圆点的节点，点击节点即选中作为默认，选中的节点使用中无法删除。
或者你也可以点击右上角的加号进行手动输入

![](https://fastly.jsdelivr.net/gh/wangn9900/tuchuang@main//img/s02.png)

# 节点订阅设置


### 打开Shadowrocket，点击右上角加号，在添加节点页面，将类型改为Subscribe，复制订阅地址粘贴到URL中，然后点击右上角完成即可。
<p><a href="shadowrocket://add/sub://{{safeBase64SubscribeUrl}}?remark={{siteName}}" target="_blank"><button class="btn btn-hero-primary"><i class="far fa fa-share"></i> 一键导入节点列表</button></a></p>

![](https://fastly.jsdelivr.net/gh/wangn9900/tuchuang@main//img/s5.jpg)

### 在Shadowrocket设置--服务器订阅中打开【打开时更新】选项。

![](https://fastly.jsdelivr.net/gh/wangn9900/tuchuang@main//img/s6.png)

回到首页，打开连接开关，享受科学上网吧！
