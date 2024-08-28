import { h } from 'vue'

export default h('section', { class: 'update-content' }, [
  h('h3', null, '新特性'),
  h('ul', null, [h('li', null, '支持缓存Bing每日一图')]),
  h('h3', null, '修复内容'),
  h('ul', null, [h('li', null, '修复撤销取消置顶不生效的问题')]),
  h('ul', null, [h('li', null, '修复无法删除经常访问的问题 (#8)')])
])
