import { h } from 'vue'

export default h('section', { class: 'update-content' }, [
  h('h3', null, '新特性'),
  h('ul', null, [
    h('li', null, '新增隐藏快捷链接标题开关'),
    h('li', null, '快捷链接宽度下限下调至80'),
    h('li', null, '新增更新时显示 changelog')
  ]),
  h('h3', null, '修复内容'),
  h('ul', null, [h('li', null, '修复快捷链接标题会吞掉下半字符或露出下一行字符头部的问题')])
])
