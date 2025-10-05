#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const projectRoot = process.cwd()

// 多个源码目录
const srcDirs = [
  path.join(projectRoot, './entrypoints'),
  path.join(projectRoot, './shared') // 如果还有 src，也可以加上
]

const pkgPath = path.join(projectRoot, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const allDeps = Object.assign({}, pkg.dependencies || {}, pkg.devDependencies || {})

// -------------------------
// 遍历文件夹
// -------------------------
function walk(dir: string, files: string[] = []) {
  if (!fs.existsSync(dir)) {
    return files
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, files)
    } else if (entry.isFile() && /\.(js|ts|vue)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

// -------------------------
// 提取 import / require
// -------------------------
function extractImports(fileContent: string) {
  const importRegex = /import\s+(?:[\s\S]+?\s+from\s+)?['"]([^'"]+)['"]/g
  const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g
  const deps: Set<string> = new Set()
  let match
  while ((match = importRegex.exec(fileContent)) !== null) {
    deps.add(match[1])
  }
  while ((match = requireRegex.exec(fileContent)) !== null) {
    deps.add(match[1])
  }
  return deps
}

// -------------------------
// 判断模块类型
// -------------------------
/**
 * @param {string} dep
 */
function detectModuleType(dep: string) {
  try {
    const depPkgPath = path.join(projectRoot, 'node_modules', dep, 'package.json')
    const depPkg = JSON.parse(fs.readFileSync(depPkgPath, 'utf-8'))
    if (depPkg.type === 'module' || depPkg.module) {
      return 'ESM'
    }
    if (depPkg.main) {
      return 'CommonJS'
    }
  } catch {
    return 'Unknown'
  }
  return 'Unknown'
}

// -------------------------
// 扫描所有源码目录
// -------------------------
const runtimeUsed = new Set()

srcDirs.forEach((srcDir) => {
  const files = walk(srcDir)
  files.forEach((file) => {
    const code = fs.readFileSync(file, 'utf-8')
    const imports = extractImports(code)
    imports.forEach((dep) => {
      if (allDeps[dep]) {
        runtimeUsed.add(dep)
      }
    })
  })
})

// -------------------------
// 输出分析报告
// -------------------------
console.log('\n🚀 依赖分析报告\n')
Object.keys(allDeps).forEach((dep) => {
  const type = detectModuleType(dep)
  const used = runtimeUsed.has(dep)
  const suggested = used ? 'dependencies' : 'devDependencies'
  console.log(
    `${dep.padEnd(35)} | ${type.padEnd(9)} | ${(used ? '✅ runtime used' : '❌ only dev').padEnd(15)} | suggested: ${suggested}`
  )
})
