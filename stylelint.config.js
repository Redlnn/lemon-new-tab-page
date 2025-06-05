export default {
  plugins: ['stylelint-scss', 'stylelint-order'],
  /* 继承某些已有的规则 */
  extends: [
    'stylelint-config-standard', // 配置stylelint拓展插件
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss', // 配置stylelint scss插件
    'stylelint-config-recess-order' // 配置stylelint css属性书写顺序插件,
  ],
  overrides: [
    // 扫描 .vue/html 文件中的<style>标签内的样式
    {
      files: ['**/*.{vue,html}'],
      customSyntax: 'postcss-html'
    }
  ],
  rules: {
    'value-keyword-case': null,
    'declaration-empty-line-before': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'keyframes-name-pattern': null,
    'property-no-vendor-prefix': null,
    'scss/dollar-variable-colon-space-after': null,
    'scss/load-partial-extension': null,
    'scss/dollar-variable-pattern': null
  }
}
