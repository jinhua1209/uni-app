import { hasOwn, isPlainObject } from '@vue/shared'
import {
  API_REQUEST,
  API_TYPE_REQUEST,
  defineTaskApi,
  RequestOptions,
  RequestProtocol,
} from '@dcloudio/uni-api'
import { base64ToArrayBuffer } from '@dcloudio/uni-api'
import { requireNativePlugin } from '../plugin/requireNativePlugin'

type Type = 'base64' | 'text'
type Headers = Record<string, string>
type Options = UniApp.RequestOptions & {
  tls: any
  headers: Headers
  type: Type
  body?: string | Data
}
interface RequestTasks {
  abort: Function
}
type RequestTaskState = {
  statusCode: number
  cookies: string[]
  header: any
  url?: string
  data: string | ArrayBuffer | any
  errMsg?: string
}

const cookiesParse = (header: Record<string, string>) => {
  let cookiesStr = header['Set-Cookie'] || header['set-cookie']
  let cookiesArr = []
  if (!cookiesStr) {
    return []
  }
  if (cookiesStr[0] === '[' && cookiesStr[cookiesStr.length - 1] === ']') {
    cookiesStr = cookiesStr.slice(1, -1)
  }
  const handleCookiesArr = cookiesStr.split(';')
  for (let i = 0; i < handleCookiesArr.length; i++) {
    if (
      handleCookiesArr[i].indexOf('Expires=') !== -1 ||
      handleCookiesArr[i].indexOf('expires=') !== -1
    ) {
      cookiesArr.push(handleCookiesArr[i].replace(',', ''))
    } else {
      cookiesArr.push(handleCookiesArr[i])
    }
  }
  cookiesArr = cookiesArr.join(';').split(',')

  return cookiesArr
}

function formatResponse(res: RequestTaskState, args: UniApp.RequestOptions) {
  if (typeof res.data === 'string' && res.data.charCodeAt(0) === 65279) {
    res.data = res.data.substr(1)
  }

  res.statusCode = parseInt(String(res.statusCode), 10)

  if (isPlainObject(res.header)) {
    res.header = Object.keys(res.header).reduce(function (ret, key) {
      const value = res.header[key]
      if (Array.isArray(value)) {
        ;(ret as any)[key] = value.join(',')
      } else if (typeof value === 'string') {
        ;(ret as any)[key] = value
      }
      return ret
    }, {})
  }

  if (args.dataType && args.dataType.toLowerCase() === 'json') {
    try {
      res.data = JSON.parse(res.data as string)
    } catch (e) {}
  }

  return res
}

/**
 * 请求任务类
 */
class RequestTask implements UniApp.RequestTask {
  private _requestTask: RequestTasks

  constructor(requestTask: RequestTasks) {
    this._requestTask = requestTask
  }

  abort() {
    this._requestTask.abort()
  }

  offHeadersReceived() {}

  onHeadersReceived() {}
}

export const request = defineTaskApi<API_TYPE_REQUEST>(
  API_REQUEST,
  (args, { resolve, reject }) => {
    let {
      header,
      method,
      data,
      timeout,
      url,
      responseType,
      sslVerify,
      firstIpv4,
      // NOTE 属性有但是types没有
      // @ts-ignore
      tls,
    } = args

    let contentType
    for (const name in header) {
      if (name.toLowerCase() === 'content-type') {
        contentType = header[name]
        break
      }
    }

    if (
      method !== 'GET' &&
      contentType.indexOf('application/json') === 0 &&
      isPlainObject(data)
    ) {
      data = JSON.stringify(data)
    }

    const stream = requireNativePlugin('stream')
    const headers: Headers = {}
    let abortTimeout: ReturnType<typeof setTimeout>
    let aborted: boolean
    let hasContentType = false

    for (const name in header) {
      if (!hasContentType && name.toLowerCase() === 'content-type') {
        hasContentType = true
        headers['Content-Type'] = header[name]
        // TODO 需要重构
        if (
          method !== 'GET' &&
          header[name].indexOf('application/x-www-form-urlencoded') === 0 &&
          typeof data !== 'string' &&
          !(data instanceof ArrayBuffer)
        ) {
          const bodyArray = []
          for (const key in data) {
            if (hasOwn(data, key)) {
              bodyArray.push(
                encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
              )
            }
          }
          data = bodyArray.join('&')
        }
      } else {
        headers[name] = header[name]
      }
    }

    if (!hasContentType && method === 'POST') {
      headers['Content-Type'] =
        'application/x-www-form-urlencoded; charset=UTF-8'
    }

    if (timeout) {
      abortTimeout = setTimeout(() => {
        aborted = true
        reject('timeout')
      }, timeout + 200) // TODO +200 发消息到原生层有时间开销，以后考虑由原生层回调超时
    }

    const options: Options = {
      method,
      url: url.trim(),
      // weex 官方文档有误，headers 类型实际 object，用 string 类型会无响应
      headers,
      type: responseType === 'arraybuffer' ? 'base64' : 'text',
      // weex 官方文档未说明实际支持 timeout，单位：ms
      timeout: timeout || 6e5,
      // 配置和weex模块内相反
      sslVerify: !sslVerify,
      firstIpv4: firstIpv4,
      tls,
    }

    if (method !== 'GET') {
      options.body = typeof data === 'string' ? data : JSON.stringify(data)
    }

    stream.fetch(
      options,
      ({
        ok,
        status,
        data,
        headers,
        errorMsg,
      }: {
        ok: boolean
        status: number
        data: string
        headers: Headers
        errorMsg: string
      }) => {
        if (aborted) {
          return
        }
        if (abortTimeout) {
          clearTimeout(abortTimeout)
        }
        const statusCode = status
        if (statusCode > 0) {
          resolve(
            formatResponse(
              {
                data:
                  ok && responseType === 'arraybuffer'
                    ? base64ToArrayBuffer(data)
                    : data,
                statusCode,
                header: headers,
                cookies: cookiesParse(headers),
              },
              args
            )
          )
        } else {
          let errMsg = 'abort statusCode:' + statusCode
          if (errorMsg) {
            errMsg = errMsg + ' ' + errorMsg
          }
          reject(errMsg)
        }
      }
    )

    return new RequestTask({
      abort() {
        aborted = true
        if (abortTimeout) {
          clearTimeout(abortTimeout)
        }
        reject('abort')
      },
    })
  },
  RequestProtocol,
  RequestOptions
)
