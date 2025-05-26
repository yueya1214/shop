import { Product } from './productService'

// 搜索结果项
export interface SearchResult<T> {
  item: T
  score: number // 相关性分数
  matches: string[] // 匹配的字段
}

// 搜索选项
export interface SearchOptions {
  fields?: string[] // 要搜索的字段
  fuzzy?: boolean // 是否启用模糊搜索
  threshold?: number // 相关性阈值 (0-1)
  limit?: number // 结果数量限制
  sort?: boolean // 是否按相关性排序
}

// 默认搜索选项
const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  fields: ['name', 'description', 'category'],
  fuzzy: true,
  threshold: 0.3,
  limit: 50,
  sort: true
}

// 中文拼音首字母映射
const PINYIN_MAP: Record<string, string[]> = {
  'a': ['阿', '啊', '吖'],
  'b': ['把', '百', '白', '班', '板', '宝', '爸', '北', '被', '备', '本', '比', '毕', '边', '变', '标', '表', '别', '并', '不', '部'],
  'c': ['才', '采', '彩', '菜', '参', '草', '层', '曾', '查', '产', '长', '常', '场', '厂', '车', '成', '城', '程', '吃', '出', '处', '楚', '初'],
  'd': ['大', '代', '带', '单', '但', '当', '到', '道', '的', '得', '等', '低', '地', '第', '点', '电', '店', '定', '东', '动', '都', '读', '度'],
  'e': ['额', '恩', '而', '二'],
  'f': ['发', '法', '反', '方', '房', '放', '非', '分', '份', '丰', '风', '封', '佛', '否', '夫', '服', '福', '府', '父', '付'],
  'g': ['该', '改', '概', '干', '刚', '高', '告', '格', '各', '给', '工', '公', '共', '够', '古', '故', '关', '管', '光', '广', '规', '国', '果', '过'],
  'h': ['还', '孩', '海', '害', '含', '汉', '好', '号', '合', '和', '河', '黑', '很', '红', '后', '候', '湖', '护', '花', '化', '话', '坏', '欢', '环', '会'],
  'i': [],
  'j': ['几', '己', '记', '济', '加', '家', '价', '检', '见', '件', '建', '健', '江', '将', '讲', '交', '角', '教', '接', '街', '节', '结', '解', '介', '金', '近', '进', '经', '京', '境', '究', '决', '绝', '觉'],
  'k': ['开', '看', '考', '科', '可', '空', '口', '苦', '快', '块', '况', '亏', '困'],
  'l': ['拉', '来', '蓝', '老', '乐', '类', '离', '李', '里', '理', '力', '历', '利', '例', '连', '两', '辆', '了', '料', '林', '另', '留', '六', '龙', '楼', '路', '录', '旅', '绿'],
  'm': ['马', '吗', '买', '卖', '满', '慢', '忙', '毛', '么', '没', '每', '美', '门', '们', '梦', '米', '面', '民', '明', '名', '命', '模', '某', '目'],
  'n': ['那', '南', '难', '脑', '呢', '内', '能', '你', '年', '念', '女', '农'],
  'o': ['哦'],
  'p': ['怕', '排', '盘', '旁', '跑', '朋', '片', '品', '平', '评', '破', '普'],
  'q': ['其', '起', '气', '期', '前', '钱', '千', '强', '桥', '亲', '轻', '请', '秋', '求', '球', '区', '取', '去', '趣', '全', '却'],
  'r': ['然', '让', '热', '人', '认', '日', '容', '如', '入', '软', '弱'],
  's': ['三', '色', '森', '杀', '山', '上', '少', '社', '身', '深', '什', '生', '声', '胜', '师', '十', '时', '识', '实', '始', '世', '事', '是', '收', '手', '受', '书', '术', '数', '双', '谁', '水', '说', '思', '死', '四', '送', '素', '虽', '所'],
  't': ['他', '她', '台', '太', '谈', '堂', '套', '特', '疼', '提', '题', '体', '天', '条', '听', '厅', '通', '同', '头', '图', '外', '湾', '完', '万', '王', '望', '为', '文', '问', '我', '无', '五', '物', '务', '西', '吸', '希', '息', '习', '系', '下', '夏', '先', '现', '相', '想', '向', '像', '小', '校', '些', '心', '新', '信', '星', '行', '性', '型', '修', '许', '需', '续', '选', '学', '雪', '血'],
  'u': [],
  'v': [],
  'w': ['外', '湾', '完', '万', '王', '望', '为', '文', '问', '我', '无', '五', '物', '务'],
  'x': ['西', '吸', '希', '息', '习', '系', '下', '夏', '先', '现', '相', '想', '向', '像', '小', '校', '些', '心', '新', '信', '星', '行', '性', '型', '修', '许', '需', '续', '选', '学', '雪', '血'],
  'y': ['亚', '烟', '言', '阳', '样', '要', '也', '业', '夜', '一', '以', '已', '亿', '义', '艺', '易', '意', '因', '音', '印', '应', '英', '影', '硬', '用', '由', '油', '游', '友', '有', '又', '右', '于', '与', '语', '育', '预', '元', '员', '院', '愿', '月', '越', '云', '运'],
  'z': ['杂', '在', '再', '早', '怎', '增', '展', '占', '战', '张', '章', '找', '着', '这', '真', '整', '正', '政', '之', '知', '直', '值', '职', '只', '指', '至', '制', '中', '众', '重', '洲', '主', '注', '住', '助', '专', '转', '装', '准', '资', '子', '自', '字', '总', '走', '最', '作', '做', '坐', '座']
}

// 将中文字符转换为拼音首字母
function chineseToPinyinInitials(text: string): string {
  let result = ''
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    let found = false
    
    // 检查字符是否在拼音映射中
    for (const [initial, chars] of Object.entries(PINYIN_MAP)) {
      if (chars.includes(char)) {
        result += initial
        found = true
        break
      }
    }
    
    // 如果不是中文字符，保持原样
    if (!found) {
      result += char
    }
  }
  
  return result
}

// 计算两个字符串的相似度（Levenshtein距离的归一化版本）
function stringSimilarity(str1: string, str2: string): number {
  // 如果字符串相等，相似度为1
  if (str1 === str2) return 1
  
  // 如果有一个是空字符串，相似度为0
  if (str1.length === 0 || str2.length === 0) return 0
  
  // 确保str1是较短的字符串
  if (str1.length > str2.length) {
    [str1, str2] = [str2, str1]
  }
  
  const str1Length = str1.length
  const str2Length = str2.length
  
  // 初始化距离矩阵
  const matrix: number[][] = []
  for (let i = 0; i <= str1Length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= str2Length; j++) {
    matrix[0][j] = j
  }
  
  // 填充距离矩阵
  for (let i = 1; i <= str1Length; i++) {
    for (let j = 1; j <= str2Length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 删除
        matrix[i][j - 1] + 1,      // 插入
        matrix[i - 1][j - 1] + cost // 替换
      )
    }
  }
  
  // 计算Levenshtein距离
  const distance = matrix[str1Length][str2Length]
  
  // 归一化为相似度分数 (0-1)
  return 1 - distance / Math.max(str1Length, str2Length)
}

// 搜索单个项目
function searchItem<T extends Record<string, any>>(
  item: T,
  query: string,
  options: SearchOptions
): SearchResult<T> | null {
  const { fields = [], fuzzy = true, threshold = 0.3 } = options
  
  // 将查询转为小写
  const queryLower = query.toLowerCase()
  const queryPinyin = chineseToPinyinInitials(queryLower)
  
  let maxScore = 0
  const matches: string[] = []
  
  // 搜索每个指定字段
  for (const field of fields) {
    if (!(field in item)) continue
    
    const value = String(item[field]).toLowerCase()
    const valuePinyin = chineseToPinyinInitials(value)
    
    let score = 0
    
    // 精确匹配
    if (value === queryLower) {
      score = 1
    } 
    // 包含匹配
    else if (value.includes(queryLower)) {
      score = 0.8
    }
    // 拼音首字母匹配
    else if (valuePinyin.includes(queryPinyin)) {
      score = 0.6
    }
    // 模糊匹配
    else if (fuzzy) {
      score = stringSimilarity(queryLower, value)
    }
    
    // 如果分数高于阈值，添加到匹配字段
    if (score > threshold && score > 0) {
      matches.push(field)
      maxScore = Math.max(maxScore, score)
    }
  }
  
  // 如果没有匹配，返回null
  if (matches.length === 0) {
    return null
  }
  
  return {
    item,
    score: maxScore,
    matches
  }
}

// 智能搜索函数
export function smartSearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  options: SearchOptions = {}
): SearchResult<T>[] {
  // 合并默认选项
  const mergedOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  
  // 如果查询为空，返回所有项目
  if (!query.trim()) {
    return items.map(item => ({
      item,
      score: 1,
      matches: []
    }))
  }
  
  // 搜索每个项目
  const results: SearchResult<T>[] = []
  
  for (const item of items) {
    const result = searchItem(item, query, mergedOptions)
    if (result) {
      results.push(result)
    }
  }
  
  // 排序结果
  if (mergedOptions.sort) {
    results.sort((a, b) => b.score - a.score)
  }
  
  // 限制结果数量
  if (mergedOptions.limit && mergedOptions.limit > 0) {
    return results.slice(0, mergedOptions.limit)
  }
  
  return results
}

// 商品智能搜索
export function searchProducts(
  products: Product[],
  query: string,
  options: SearchOptions = {}
): SearchResult<Product>[] {
  // 设置商品特定的搜索选项
  const productSearchOptions: SearchOptions = {
    fields: ['name', 'description', 'category'],
    ...options
  }
  
  return smartSearch(products, query, productSearchOptions)
}

// 获取搜索建议
export function getSearchSuggestions(
  products: Product[],
  query: string,
  limit: number = 5
): string[] {
  if (!query.trim()) return []
  
  // 搜索商品
  const results = searchProducts(products, query, {
    limit,
    threshold: 0.2
  })
  
  // 提取建议
  const suggestions = new Set<string>()
  
  for (const result of results) {
    // 添加商品名称
    suggestions.add(result.item.name)
    
    // 添加商品分类
    if (suggestions.size < limit) {
      suggestions.add(result.item.category)
    }
    
    // 如果已经有足够的建议，停止添加
    if (suggestions.size >= limit) break
  }
  
  return Array.from(suggestions).slice(0, limit)
} 