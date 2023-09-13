addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});

const tokenURL = 'https://www.googleapis.com/oauth2/v4/token';
const client_id = '换成自己的 客户端ID';
const client_secret = '换成自己的 客户端密钥';
const grantType = 'authorization_code';
const redirectURI = 'https://换成自己（在谷歌API里通过认证）的域名或搭建的workers域名';
const jsURL = 'https://github.com/janethan/GDIndex_backup/raw/master/build/worker.js';

async function handleRequest(request) {
    let title = getParameterByName(request.url, 'site_name') || 'Drive Index';
    let auth_code = getParameterByName(request.url, 'auth_code');
    let root = getParameterByName(request.url, 'root') || 'root';
    let user = getParameterByName(request.url, 'user') || '';
    let password = getParameterByName(request.url, 'pass') || '';
    let codeJS = '';

    if (auth_code) {
        let tokenResp = await requestToken(auth_code);

        if (tokenResp.refresh_token !== undefined) {
            const codeResp = await fetch(jsURL, null);
            let code = await codeResp.text();
            code = code.replaceKV('title', title)
                .replaceKV('pass', password)
                .replaceKV('client_id', client_id)
                .replaceKV('client_secret', client_secret)
                .replaceKV('refresh_token', tokenResp.refresh_token)
                .replaceKV('user', user)
                .replaceKV('default_root_id', root);
            codeJS = escapeHtml(code)
        }
    }

    const init = {
        headers: {
            'content-type': 'text/html;charset=UTF-8',
        },
    };

    let respHTML = `
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no"/>
    <title>Drive Index</title>
    <link rel="icon" type="image/x-icon" href="https://www.cloudflare.com/favicon.ico"/>
    <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.0.0/dist/slate/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min.js"></script>

    <style>
        /*snippet.css*/
        .snippet {
            position: relative;
            overflow: visible;
        }

        .snippet code {
            font-size: 14px;
            line-height: 20px;
        }

        .snippet .btn {
            -webkit-transition: opacity 0.3s ease-in-out;
            -o-transition: opacity 0.3s ease-in-out;
            transition: opacity 0.3s ease-in-out;
            opacity: 0;
            padding: 2px 6px;
            position: absolute;
            right: 4px;
            top: 4px;
            font-size: 13px;
            font-weight: 700;
            line-height: 20px;
            color: #fff;
            white-space: nowrap;
            vertical-align: middle;
            cursor: pointer;
            background-color: #eee;
            background-image: linear-gradient(#fcfcfc,#eee);
            border: 1px solid #d5d5d5;
            border-radius: 3px;
        }

        .snippet:hover .btn,
        .snippet .btn:focus {
            opacity: 1;
        }

        @media screen and (max-width: 768px) {
            .snippet .btn {
                opacity: 1;
            }
        }

        code {
            background-color: #000;
            border-radius: 3px;
            color: #fff;
            font-size: 85%;
            margin: 0;
            padding: 0.2em;
        }

        .hljs-keyword {
            color: #008080;
            font-weight: normal;
        }

        /*primer.css*/
        .tooltipped {
            position: relative
        }

        .tooltipped:after {
            position: absolute;
            z-index: 1000000;
            display: none;
            padding: 5px 8px;
            font: normal normal 11px/1.5 Helvetica,arial,nimbussansl,liberationsans,freesans,clean,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";
            color: #fff;
            text-align: center;
            text-decoration: none;
            text-shadow: none;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: break-word;
            white-space: pre;
            pointer-events: none;
            content: attr(aria-label);
            background: rgba(0,0,0,0.8);
            border-radius: 3px;
            -webkit-font-smoothing: subpixel-antialiased
        }

        .tooltipped:before {
            position: absolute;
            z-index: 1000001;
            display: none;
            width: 0;
            height: 0;
            color: rgba(0,0,0,0.8);
            pointer-events: none;
            content: "";
            border: 5px solid transparent
        }

        .tooltipped:hover:before,.tooltipped:hover:after,.tooltipped:active:before,.tooltipped:active:after,.tooltipped:focus:before,.tooltipped:focus:after {
            display: inline-block;
            text-decoration: none
        }

        .tooltipped-multiline:hover:after,.tooltipped-multiline:active:after,.tooltipped-multiline:focus:after {
            display: table-cell
        }

        .tooltipped-s:after,.tooltipped-se:after,.tooltipped-sw:after {
            top: 100%;
            right: 50%;
            margin-top: 5px
        }

        .tooltipped-s:before,.tooltipped-se:before,.tooltipped-sw:before {
            top: auto;
            right: 50%;
            bottom: -5px;
            margin-right: -5px;
            border-bottom-color: rgba(0,0,0,0.8)
        }

        .tooltipped-se:after {
            right: auto;
            left: 50%;
            margin-left: -15px
        }

        .tooltipped-sw:after {
            margin-right: -15px
        }

        .tooltipped-n:after,.tooltipped-ne:after,.tooltipped-nw:after {
            right: 50%;
            bottom: 100%;
            margin-bottom: 5px
        }

        .tooltipped-n:before,.tooltipped-ne:before,.tooltipped-nw:before {
            top: -5px;
            right: 50%;
            bottom: auto;
            margin-right: -5px;
            border-top-color: rgba(0,0,0,0.8)
        }

        .tooltipped-ne:after {
            right: auto;
            left: 50%;
            margin-left: -15px
        }

        .tooltipped-nw:after {
            margin-right: -15px
        }

        .tooltipped-s:after,.tooltipped-n:after {
            -webkit-transform: translateX(50%);
            -ms-transform: translateX(50%);
            transform: translateX(50%)
        }

        .tooltipped-w:after {
            right: 100%;
            bottom: 50%;
            margin-right: 5px;
            -webkit-transform: translateY(50%);
            -ms-transform: translateY(50%);
            transform: translateY(50%)
        }

        .tooltipped-w:before {
            top: 50%;
            bottom: 50%;
            left: -5px;
            margin-top: -5px;
            border-left-color: rgba(0,0,0,0.8)
        }

        .tooltipped-e:after {
            bottom: 50%;
            left: 100%;
            margin-left: 5px;
            -webkit-transform: translateY(50%);
            -ms-transform: translateY(50%);
            transform: translateY(50%)
        }

        .tooltipped-e:before {
            top: 50%;
            right: -5px;
            bottom: 50%;
            margin-top: -5px;
            border-right-color: rgba(0,0,0,0.8)
        }

        .tooltipped-multiline:after {
            width: -moz-max-content;
            width: max-content;
            max-width: 250px;
            word-break: break-word;
            word-wrap: normal;
            white-space: pre-line;
            border-collapse: separate
        }

        .tooltipped-multiline.tooltipped-s:after,.tooltipped-multiline.tooltipped-n:after {
            right: auto;
            left: 50%;
            -webkit-transform: translateX(-50%);
            -ms-transform: translateX(-50%);
            transform: translateX(-50%)
        }

        .tooltipped-multiline.tooltipped-w:after,.tooltipped-multiline.tooltipped-e:after {
            right: 100%
        }

        @media screen and (min-width: 0\\0) {
            .tooltipped-multiline:after {
                width: 250px
            }
        }

        .tooltipped-sticky:before,.tooltipped-sticky:after {
            display: inline-block
        }

        .tooltipped-sticky.tooltipped-multiline:after {
            display: table-cell
        }
    </style>
</head>
<body>
<div class="container">
<br>
<a href="/"><img border="0" alt="janethan/GDIndex" src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" height="" width="150px"></a>
<a href="https://github.com/janethan/GDIndex/"><h5>谷歌网盘索引生成器</h5></a>
<br>
      <div id="loginuser" style="display:block;">
          <h3>1. <a href="https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirectURI}&response_type=code&access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&prompt=select_account+consent"><img src="https://developers.google.com/identity/images/btn_google_signin_dark_normal_web.png"></a></h3>
      </div>
      <div id="loggedinuser" style="display:none;"><h3>1. Login Successful（登录成功）</h3></div>
      <div id="logoutuser" style="display:none;"><h3>1. <a href="/">Click Here（点击这里）</a> to Logout or Refresh the page.（注销或刷新页面。）</h3></div>

      <p>The App requests permissions to access your Google Drive files so do not share this information with anyone else.</p>
      <p>注：该应用程序请求访问您的 Google 云端硬盘文件的权限，因此请勿与其他任何人共享此信息。</p>
  <br>
  <div id="secondstep" style="display:block;">
<h3>2. 确认详细信息</h3>
<form>

<div class="col-md-8">
<div class="mb-3">
  <label for="authcode" class="form-label">Authentication Code（验证码）</label>
  <input type="hidden" class="form-control" id="authcode" name="auth_code" aria-describedby="authcodefromgoogle" required>
  <div id="authcodefromgoogle" class="form-text">This Code is auto Generated by Google. Please fill the below details and click on submit.<br>
  该代码由 Google 自动生成。请填写以下详细信息并单击“Submit（提交）”。</div>
</div>

<div class="mb-3">
  <label for="title" class="form-label">站点名称</label>
  <input type="text" class="form-control" name="site_name" id="title">
</div>

<div class="mb-3">
  <label for="driveId" class="form-label">Share Drive ID or root（共享驱动器ID或 root）</label>
  <input type="text" class="form-control" value="root" name="root" id="driveId" required>
</div>

<div class="mb-3">
  <label for="user">Username (添加访问索引的用户名，默认已禁用，留空即可)</label>
  <input type="text" class="form-control"  name="user"id="user">
</div>
<div class="mb-3">
  <label for="pass">Password (添加访问索引的密码，默认已禁用，留空即可)</label>
  <input type="password" class="form-control" name="pass" id="pass">
</div>


</div>

<button type="submit" class="btn btn-primary">Submit（提交）</button>

</form>
  </div>
  <div id="secondstep1" style="display:none;">
  <h3>2. 确认详细信息</h3>
  处理成功，如果失败或代码为空，请单击<a href="/">这里</a>重试。
  </div>
  <br><br>
  <h3 id="thirdstep">
      3. 复制以下代码并粘贴到<a href="https://dash.cloudflare.com" target="_blank">Cloudflare Workers</a>
  </h3>
  <div id="thirdstep1" class="overflow-auto" style="background-color:#000;">
      <pre class="snippet"><code class="html js">${codeJS}</code></pre>
  </div>
  <center><p>© <span id="year"></span> - Cloud Cyber Systems</p></center>
</div>

<script>
    document.getElementById("year").innerHTML = new Date().getFullYear();
    /*snippets.js*/
    var snippets = document.querySelectorAll('.snippet');

    [].forEach.call(snippets, function(snippet) {
        snippet.firstChild.insertAdjacentHTML('beforebegin', '<button class="btn" data-clipboard-snippet><img class="clippy" width="13" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjEwMjQiIHdpZHRoPSI4OTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTEyOCA3NjhoMjU2djY0SDEyOHYtNjR6IG0zMjAtMzg0SDEyOHY2NGgzMjB2LTY0eiBtMTI4IDE5MlY0NDhMMzg0IDY0MGwxOTIgMTkyVjcwNGgzMjBWNTc2SDU3NnogbS0yODgtNjRIMTI4djY0aDE2MHYtNjR6TTEyOCA3MDRoMTYwdi02NEgxMjh2NjR6IG01NzYgNjRoNjR2MTI4Yy0xIDE4LTcgMzMtMTkgNDVzLTI3IDE4LTQ1IDE5SDY0Yy0zNSAwLTY0LTI5LTY0LTY0VjE5MmMwLTM1IDI5LTY0IDY0LTY0aDE5MkMyNTYgNTcgMzEzIDAgMzg0IDBzMTI4IDU3IDEyOCAxMjhoMTkyYzM1IDAgNjQgMjkgNjQgNjR2MzIwaC02NFYzMjBINjR2NTc2aDY0MFY3Njh6TTEyOCAyNTZoNTEyYzAtMzUtMjktNjQtNjQtNjRoLTY0Yy0zNSAwLTY0LTI5LTY0LTY0cy0yOS02NC02NC02NC02NCAyOS02NCA2NC0yOSA2NC02NCA2NGgtNjRjLTM1IDAtNjQgMjktNjQgNjR6IiAvPgo8L3N2Zz4K" alt="Copy to clipboard"></button>');
    });

    var clipboardSnippets = new ClipboardJS('[data-clipboard-snippet]', {
        target: function(trigger) {
            return trigger.nextElementSibling;
        }
    });

    clipboardSnippets.on('success', function(e) {
        e.clearSelection();

        showTooltip(e.trigger, 'Copied!');
    });

    clipboardSnippets.on('error', function(e) {
        showTooltip(e.trigger, fallbackMessage(e.action));
    });

    /*tooltips.js*/
    var btns = document.querySelectorAll('.btn');

    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('mouseleave', clearTooltip);
        btns[i].addEventListener('blur', clearTooltip);
    }

    function clearTooltip(e) {
        e.currentTarget.setAttribute('class', 'btn');
        e.currentTarget.removeAttribute('aria-label');
    }

    function showTooltip(elem, msg) {
        elem.setAttribute('class', 'btn tooltipped tooltipped-s');
        elem.setAttribute('aria-label', msg);
    }

    // Simplistic detection, do not use it in production
    function fallbackMessage(action) {
        var actionMsg = '';
        var actionKey = (action === 'cut' ? 'X' : 'C');

        if(/iPhone|iPad/i.test(navigator.userAgent)) {
            actionMsg = 'No support :(';
        }
        else if (/Mac/i.test(navigator.userAgent)) {
            actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
        }
        else {
            actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
        }

        return actionMsg;
    }
var url_string = window.location.href;
var url = new URL(url_string);
var getauthcode = url.searchParams.get("code");
var getauthcode1 = url.searchParams.get("auth_code");
document.getElementById("authcode").value = getauthcode;
if (getauthcode == null && getauthcode1 == null) {
    document.getElementById("loginuser").style.display = "block";
    document.getElementById("secondstep").style.display = "none";
    document.getElementById("secondstep1").style.display = "none";
    document.getElementById("thirdstep").style.display = "none";
    document.getElementById("thirdstep1").style.display = "none";
}
else if (getauthcode != null) {
    document.getElementById("loginuser").style.display = "none";
    document.getElementById("loggedinuser").style.display = "block";
    document.getElementById("thirdstep").style.display = "none";
    document.getElementById("thirdstep1").style.display = "none";
} else if (getauthcode1 != null) {
    document.getElementById("secondstep").style.display = "none";
    document.getElementById("secondstep1").style.display = "block";
    document.getElementById("loginuser").style.display = "none";
    document.getElementById("loggedinuser").style.display = "none";
    document.getElementById("logoutuser").style.display = "block";
}

</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
</body>
</html>
`;

    return new Response(respHTML, init)
}

async function requestToken(authCode) {
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const data = {
        code: authCode,
        client_id: client_id,
        client_secret: client_secret,
        grant_type: grantType,
        redirect_uri: redirectURI
    };

    const init = {
        method: 'POST',
        headers: headers,
        body: enQuery(data)
    };

    const response = await fetch(tokenURL, init);
    return await response.json();
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

String.prototype.replaceKV = function (k, v) {
    return this.replace(new RegExp('("' + k + '": )".*"'), '$1' + '\"' + v + '\"');
};

function enQuery(data) {
    const ret = [];
    for (let d in data) {
        if (data.hasOwnProperty(d)) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        }
    }
    return ret.join('&');
}

function getParameterByName(url, name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    name = name.replace(/\//g, '');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);

    if (!results) return null;
    else if (!results[2]) return '';
    else if (results[2]) {
        results[2] = results[2].replace(/\//g, '')
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
