import axios from '@/entrypoints/newtab/js/plugins/axios'
import fetchJsonp from './fetchJsonp'

interface BingSuggestItem {
  Txt: string
  Type: string
  Sk: string
  HCS?: number
}

interface BingSuggest {
  AS: {
    Query: string
    FullResults: number
    Results: [
      {
        Type: string
        Suggests: BingSuggestItem[]
      }
    ]
  }
}

async function bingSuggestParser(text: string): Promise<string[]> {
  const url = `https://api.bing.com/qsonhs.aspx?q=${encodeURIComponent(text)}`
  const response = await axios.get(url)
  console.debug(response)
  if (response.status === 200) {
    const resp: BingSuggest = response.data
    if (resp['AS']['FullResults'] <= 0) {
      return []
    }
    const originSuggestions = resp['AS']['Results'][0]['Suggests']
    const suggestions: string[] = []
    originSuggestions.forEach((originSuggestion) => {
      suggestions.push(originSuggestion.Txt)
    })
    return suggestions
  } else {
    console.error(`An error occurred while getting Bing search suggestions.`)
    console.error(response)
    return []
  }
}

// interface BaiduSuggest {
//   q: string
//   p: boolean
//   s: string[]
// }

function baiduJsonpParser(text: string): string[] {
  // window.baidu.sug({q:"1",p:false,s:["192.1681.1","1公顷等于多少平方米","1g等于多少mg","163邮箱登录","1升等于多少斤","1克等于多少毫克","12生肖","1升等于多少毫升","12生肖排行顺序","12304是什么电话号码"]});
  const match = text.match(/\[.*\]/)
  if (match && match[0]) {
    return JSON.parse(match[0])
  } else {
    throw new Error(`Parse jsonp error, text: ${text}`)
  }
}

async function baiduSuggestParser(text: string): Promise<string[]> {
  const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(text)}&cb=window.baidu.sug`
  const res = await fetchJsonp(
    url,
    {
      parser: baiduJsonpParser,
      jsonpCallback: 'cb',
      jsonpCallbackFunction: 'window.baidu.sug'
    },
    { timeout: 1000 }
  )
  if (res[0] === text) {
    return res.slice(1)
  } else {
    return res
  }
}

interface GoogleSuggest {
  [index: number]: any
  0: string
  1: string[]
  2: string[]
  3: any[]
  4: {
    'google:clientdata': {
      bpc: boolean
      tlw: boolean
    }
    'google:suggestrelevance': number[]
    'google:suggestsubtypes': number[][]
    'google:suggesttype': string[]
    'google:verbatimrelevance': number
  }
}

async function googleSuggestParser(text: string): Promise<string[]> {
  // 替换%s为text然后发起get请求
  const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
    text
  )}`
  const response = await axios.get(url)
  if (response.status === 200) {
    const resp: GoogleSuggest = response.data
    return resp[1]
  } else {
    console.error(`An error occurred while getting Bing search suggestions.`)
    console.error(response)
    return []
  }
}

export { baiduSuggestParser, bingSuggestParser, googleSuggestParser }
