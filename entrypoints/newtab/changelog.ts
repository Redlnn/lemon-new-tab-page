import { h } from 'vue'

export default h('section', { class: 'update-content' }, [
  h('h3', null, '新特性'),
  h('ul', null, [
    h('li', null, '部分重构以支持 FireFox 浏览器'),
    h('li', null, '支持缓存 Bing 每日一图'),
    h('li', null, '本地背景或已缓存的 Bing 壁纸新增进入动画')
  ]),
  h('h3', null, '修复内容'),
  h('ul', null, [
    h('li', null, '修复撤销取消置顶不生效的问题'),
    h('li', null, '修复无法删除经常访问的问题 (#8)'),
    h('li', null, '修复【启用最常访问】开关不生效的问题')
  ])
])
