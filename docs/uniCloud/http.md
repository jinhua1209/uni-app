## 操作场景

云函数URL化 是 uniCloud 为开发者提供的 HTTP 访问服务，让开发者可以通过 HTTP URL 方式访问到云函数。

- 场景1：比如App端微信支付，需要配服务器回调地址，此时需要一个HTTP URL。
- 场景2：非uni-app开发的系统，想要连接uniCloud，读取数据，也需要通过HTTP URL方式访问。

云函数默认是只有自己的app在前端通过`uniCloud.callFunction`来调用的，不会暴露到外网。一旦URL化后，开发者需要关注业务和资源安全。
- 安全：为了保障业务安全性，开发者需在代码中做好权限控制和安全防护，避免未授权访问触发敏感操作。
- 计费：云函数开启了URL化后，如果遇到大量恶意访问，消耗云函数资源，开发者可以将云函数访问地址设置为空即可停止 HTTP 访问支持。

本文档主要指导您如何在uniCloud web控制台管理和使用云函数URL化。

**使用限制**

- 腾讯云免费服务空间最多只支持配置10个云函数URL化地址
- 阿里云暂不支持修改响应头中的content-disposition，即无法返回html并在浏览器中展示，只可以触发下载

## 操作步骤

### 设置云函数 HTTP 访问地址

1. 登录[uniCloud后台](https://unicloud.dcloud.net.cn/)，选择需要管理的服务空间。
2. 单击左侧菜单栏【云函数】，进入云函数页面。
3. 点击需要配置的云函数的【详情】按钮，配置访问路径。

<img style="max-width:800px;height:auto;" src="https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-dc-site/b79d1dc0-5a21-11eb-8a36-ebb87efcf8c0.jpg"></img>

### 绑定自定义域名

**目前阿里云不支持绑定自定义域名，只能使用其默认提供的域名，但是需要手动在【云函数域名绑定】处开启云函数Url化开关**

**2021年5月25日起腾讯云绑定域名CNAME记录值由默认域名调整为腾讯云给定的`CNAME域名`，已经绑定正常使用的域名无需调整**

1. 单击左侧菜单栏【云函数】，进入云函数页面。
2. 单击【云函数域名绑定】，在弹出的配置窗口中进行配置。

<img style="max-width:800px;height:auto;" src="https://bjetxgzv.cdn.bspapp.com/VKCEYUGU-dc-site/55897b30-5993-11eb-8ff1-d5dcf8779628.jpg"></img>

上一步中填写域名证书且绑定成功后会返回一个`CNAME域名`，将绑定的域名配置CNAME记录值为此`CNAME域名`即可

**注意**

- 每个服务空间最多绑定1个自定义域名
- uniCloud提供默认域名供体验和测试该特性
- 需要注意的是绑定的域名必须已经备案
- 单个服务空间可支持被访问的最大 QPS 为5000，单个云函数可支持被访问的最大 QPS 为2000（具体频次受函数并发限制）
- 默认域名可支持被访问的最大 QPS 为200，推荐您绑定自定义域名以获取更大的访问频次

如需要更高的QPS支持，请发邮件到service@dcloud.io申请。若您还没有SSL证书，点此[快速获取](https://cloud.tencent.com/act/cps/redirect?redirect=33848&cps_key=c858f748f10419214b870236b5bb94c6)

**关于证书内容与私钥**

申请证书时通常会有下载选项，下载到证书之后找到对应Nginx的证书（包含一个crt文件和一个key文件），以文本形式打开crt文件即可看到证书内容，同样的key文件对应着私钥。

### 通过 HTTP URL 方式访问云函数

- 方式一：通过`https://${云函数Url化域名}/${path}`直接访问函数，其中`${path}`是配置的函数触发路径。
```sh
$ curl https://${云函数Url化域名}/${path}
```

- 方式二：直接在浏览器内打开`https://${云函数Url化域名}/${path}`。

### 云函数的入参

使用 HTTP 访问云函数时，HTTP 请求会被转化为特殊的结构体，称之为**集成请求**，结构如下：

```shell
{
    path: 'HTTP请求路径，如 /hello',
    httpMethod: 'HTTP请求方法，如 GET',
    headers: {HTTP请求头},
    queryStringParameters: {HTTP请求的Query，键值对形式},
    body: 'HTTP请求体',
    isBase64Encoded: 'true or false，表示body是否为Base64编码'
}
```

下面是一个示例：
```shell
{
    path: '/',
    httpMethod: 'GET',
    headers: {
        'host': 'xxx.service.tcloudbase.com',
        'connection': 'close',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
    },
    isBase64Encoded: false,
    body: ''
}
```


**示例**

使用GET请求`https://${云函数Url化域名}/${functionPath}?a=1&b=2`，云函数接收到的`event`为

```
{
    path: '/',
    httpMethod: 'GET',
    headers: {HTTP请求头},
    queryStringParameters: {a: "1", b: "2"},
    isBase64Encoded: false
}
```


使用POST请求`https://${spaceId}.service.tcloudbase.com/${functionPath}`，云函数接收到的`event.body`为请求发送的数据，**uni.request默认content-type为application/json**

```js
// 以uni.request为例
uni.request({
  method: 'POST',
  url: 'https://${云函数Url化域名}/${functionPath}',
  data: {
    a: 1,
    b: 2
  },
  success(res) {
    console.log(res);
  }
})

// 云函数收到的event为, 注意如果直接return此格式数据可能会被作为集成响应处理，参考下面的集成响应文档
{
    path: '/',
    httpMethod: 'POST',
    headers: {
    	...
    	"content-type": 'application/json'
    },
    isBase64Encoded: false,
    body: '{"a":1,"b":2}', // 注意此处可能是base64，需要根据isBase64Encoded判断
}
```

**注意**

- 阿里云目前请求与响应有如下限制
  + 请求Body大小限制，不能超过1M。
  + 响应Body大小限制，不能超过1M。

- 腾讯云目前请求与响应有如下限制
  + 请求Body大小限制，不能超过4M。
  + 响应Body大小限制，不能超过6M。

>在云函数URL化的场景无法获取客户端平台信息，可以在调用依赖客户端平台的接口接口之前（推荐在云函数入口）通过修改context.PLATFORM手动传入客户端平台信息

例：

```js
exports.main = async (event, context) => {
	context.PLATFORM = 'app-plus'
}
```

云函数接收到的post请求的请求体可能是被转成base64的，如果是这样需要进行一次转化。

以接收application/json格式的post请求为例

```js
exports.main = function(event) {
    let body = event.body
    if(event.isBase64Encoded){
      body = Buffer.from(body)
    }
    const param = JSON.parse(body) // param为客户端上传的数据
    // ...
}
```


### 云函数的返回值

云函数可以返回`string`、`object`、`number`等类型的数据，或者返回 [集成响应](#Integrationresponse)，随后云接入会将返回值转化为正常的 HTTP 响应。

#### 返回字符串或数字

云函数返回字符串，那么：
```js
exports.main = function() {
    return 'hello gateway'
}
```

最终 HTTP 响应为：
```shell
HTTP/1.1 200 OK
date: Mon, 16 Dec 2019 08:35:31 GMT
content-type: text/plain; charset=utf-8
content-length: 13

hello gateway
```

#### 返回 Object

返回的`Object`会被转换为 JSON，同时 HTTP 响应的`content-type`会被设置为 `application/json`：

```js
exports.main = function() {
    return {
        foo: 'bar'
    }
}
```

最终 HTTP 响应为：
```shell
HTTP/1.1 200 OK
date: Mon, 16 Dec 2019 08:35:31 GMT
content-type: application/json; charset=utf-8
content-length: 13

{"foo":"bar"}
```

#### 返回集成响应@Integrationresponse

云函数可以返回如下这样特殊结构的**集成响应**，来自由地控制响应体：

```json
{
    "mpserverlessComposedResponse": true, // 使用阿里云返回集成响应是需要此字段为true
    "isBase64Encoded": true|false,
    "statusCode": httpStatusCode,
    "headers": { "headerName": "headerValue", ... },
    "body": "..."
}
```

##### 使用集成响应返回 HTML

将`content-type`设置为`text/html`，即可在`body`中返回 HTML，会被浏览器自动解析：

**阿里云目前无法返回html并在浏览器中展示，只可以触发下载**

```js
exports.main = function() {
    return {
        mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
        statusCode: 200,
        headers: {
            'content-type': 'text/html'
        },
        body: '<h1>Hello</h1>'
    }
}
```

最终 HTTP 响应为：
```shell
HTTP/1.1 200 OK
date: Mon, 16 Dec 2019 08:35:31 GMT
content-type: text/html; charset=utf-8
content-length: 14

<h1>Hello</h1>
```

##### 使用集成响应返回 JS 文件

将`content-type`设置为`application/javascript`，即可在`body`中返回 JavaScript 文件：

```js
exports.main = function() {
    return {
        mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
        statusCode: 200,
        headers: {
            'content-type': 'application/javascript'
        },
        body: 'console.log("Hello!")'
    }
}
```

最终 HTTP 响应为：
```shell
HTTP/1.1 200 OK
date: Mon, 16 Dec 2019 08:35:31 GMT
content-type: application/javascript; charset=utf-8
content-length: 21

console.log("Hello!")
```

##### 使用集成响应返回二进制文件

如果返回体是诸如图片、音视频这样的二进制文件，那么可以将`isBase64Encoded`设置为`true`，并且将二进制文件内容转为 Base64 编码的字符串，例如：

```js
exports.main = function() {
    return {
        mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
        isBase64Encoded: true,
        statusCode: 200,
        headers: {
            'content-type': 'image/png'
        },
        body: 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAY...'
    }
}
```

最终 HTTP 响应为一张 PNG 图片：

```shell
HTTP/1.1 200 OK
date: Mon, 16 Dec 2019 08:35:31 GMT
content-type: image/png
content-length: 9897

<binary payload...>
```

##### 返回不同的状态码

如需重定向或返回4xx，5xx等自定义状态码等，可以使用如下方式

**注意：阿里云暂不支持在返回的header里面使用location**

```js
exports.main = function() {
    return {
        mpserverlessComposedResponse: false, // 使用阿里云返回集成响应是需要此字段为true
        isBase64Encoded: false,
        statusCode: 301,
        headers: {
            'location': 'http://www.baidu.com'
        }
    }
}
```
