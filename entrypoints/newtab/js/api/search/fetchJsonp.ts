import { type AxiosRequestConfig } from 'axios'
import axios from '@/entrypoints/newtab/js/plugins/axios'

interface fetchJsonpOptions {
  parser: (text: string) => string[]
  jsonpCallback?: string
  jsonpCallbackFunction?: string | undefined
}

const defaultOptions = {
  jsonpCallback: 'callback',
  jsonpCallbackFunction: undefined
}

function generateCallbackFunction() {
  return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000)
}

async function fetchJsonp(
  _url: string,
  options: fetchJsonpOptions,
  axiosOptions: AxiosRequestConfig | undefined = undefined
): Promise<string[]> {
  let url = _url
  const jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback
  const callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction()

  url += url.indexOf('?') === -1 ? '?' : '&'

  const response = await axios.get(`${url}${jsonpCallback}=${callbackFunction}`, axiosOptions)
  if (response.status !== 200) {
    throw new Error(`fetchJsonp: request jsonp failed, status code: ${response.status}`)
  } else {
    const { data } = response
    if (typeof data === 'string') {
      return options.parser(data)
    } else {
      throw new Error(`fetchJsonp: invalid response data, data: ${data}`)
    }
  }
}

export default fetchJsonp
