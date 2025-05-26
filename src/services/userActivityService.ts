// 用户活动和积分服务

// 用户活动类型
export enum ActivityType {
  LOGIN = 'login',                 // 登录
  PURCHASE = 'purchase',           // 购买商品
  REVIEW = 'review',               // 评价商品
  SHARE = 'share',                 // 分享商品
  COMPLETE_PROFILE = 'profile',    // 完善个人资料
  DAILY_CHECK = 'daily_check',     // 每日签到
  CONSECUTIVE_LOGIN = 'consecutive_login' // 连续登录
}

// 活动记录
interface ActivityRecord {
  userId: string
  type: ActivityType
  points: number
  timestamp: Date
  metadata?: Record<string, any> // 额外信息，如购买的商品ID等
}

// 用户等级定义
export interface UserLevel {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  benefits: string[]
}

// 用户等级配置
export const USER_LEVELS: UserLevel[] = [
  {
    level: 1,
    name: '铜牌会员',
    minPoints: 0,
    maxPoints: 999,
    benefits: ['基础购物功能']
  },
  {
    level: 2,
    name: '银牌会员',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: ['商品9.8折', '生日礼包']
  },
  {
    level: 3,
    name: '金牌会员',
    minPoints: 5000,
    maxPoints: 19999,
    benefits: ['商品9.5折', '生日礼包', '专属客服']
  },
  {
    level: 4,
    name: '钻石会员',
    minPoints: 20000,
    maxPoints: Infinity,
    benefits: ['商品9折', '生日礼包', '专属客服', '免运费']
  }
]

// 活动积分配置
export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  [ActivityType.LOGIN]: 10,
  [ActivityType.PURCHASE]: 100, // 基础值，实际会乘以订单金额比例
  [ActivityType.REVIEW]: 50,
  [ActivityType.SHARE]: 30,
  [ActivityType.COMPLETE_PROFILE]: 200,
  [ActivityType.DAILY_CHECK]: 20,
  [ActivityType.CONSECUTIVE_LOGIN]: 5 // 每天额外增加，连续登录越久，额外积分越多
}

// 本地存储键名
const USER_ACTIVITIES_KEY = 'user_activities'
const USER_POINTS_KEY = 'user_points'
const USER_LAST_LOGIN_KEY = 'user_last_login'
const USER_CONSECUTIVE_DAYS_KEY = 'user_consecutive_days'

// 获取用户活动记录
export function getUserActivities(userId: string): ActivityRecord[] {
  try {
    const activitiesString = localStorage.getItem(USER_ACTIVITIES_KEY)
    if (!activitiesString) return []
    
    const allActivities = JSON.parse(activitiesString) as ActivityRecord[]
    return allActivities
      .filter(activity => activity.userId === userId)
      .map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
  } catch (error) {
    console.error('获取用户活动记录失败', error)
    return []
  }
}

// 获取用户积分
export function getUserPoints(userId: string): number {
  try {
    const pointsString = localStorage.getItem(USER_POINTS_KEY)
    if (!pointsString) return 0
    
    const allUserPoints = JSON.parse(pointsString) as Record<string, number>
    return allUserPoints[userId] || 0
  } catch (error) {
    console.error('获取用户积分失败', error)
    return 0
  }
}

// 记录用户活动并增加积分
export function recordUserActivity(
  userId: string, 
  type: ActivityType, 
  metadata?: Record<string, any>
): number {
  if (!userId) return 0
  
  try {
    // 计算活动积分
    let points = ACTIVITY_POINTS[type]
    
    // 特殊处理购买积分（根据订单金额）
    if (type === ActivityType.PURCHASE && metadata?.amount) {
      points = Math.floor(metadata.amount * 10) // 每消费1元获得10积分
    }
    
    // 特殊处理连续登录
    if (type === ActivityType.LOGIN) {
      const consecutiveDays = updateConsecutiveLoginDays(userId)
      if (consecutiveDays > 1) {
        // 额外积分 = 基础积分 + (连续天数 * 连续登录积分)
        const extraPoints = Math.min(consecutiveDays * ACTIVITY_POINTS[ActivityType.CONSECUTIVE_LOGIN], 100)
        points += extraPoints
        
        // 记录连续登录活动
        recordActivityToStorage(userId, ActivityType.CONSECUTIVE_LOGIN, extraPoints, {
          days: consecutiveDays
        })
      }
    }
    
    // 记录活动
    recordActivityToStorage(userId, type, points, metadata)
    
    // 更新总积分
    updateUserPoints(userId, points)
    
    return points
  } catch (error) {
    console.error('记录用户活动失败', error)
    return 0
  }
}

// 内部函数：记录活动到存储
function recordActivityToStorage(
  userId: string, 
  type: ActivityType, 
  points: number, 
  metadata?: Record<string, any>
): void {
  // 获取所有活动记录
  const activitiesString = localStorage.getItem(USER_ACTIVITIES_KEY)
  const allActivities: ActivityRecord[] = activitiesString ? JSON.parse(activitiesString) : []
  
  // 添加新记录
  allActivities.push({
    userId,
    type,
    points,
    timestamp: new Date(),
    metadata
  })
  
  // 保存回本地存储
  localStorage.setItem(USER_ACTIVITIES_KEY, JSON.stringify(allActivities))
}

// 内部函数：更新用户总积分
function updateUserPoints(userId: string, pointsToAdd: number): number {
  // 获取所有用户积分
  const pointsString = localStorage.getItem(USER_POINTS_KEY)
  const allUserPoints: Record<string, number> = pointsString ? JSON.parse(pointsString) : {}
  
  // 更新当前用户积分
  const currentPoints = allUserPoints[userId] || 0
  const newPoints = currentPoints + pointsToAdd
  allUserPoints[userId] = newPoints
  
  // 保存回本地存储
  localStorage.setItem(USER_POINTS_KEY, JSON.stringify(allUserPoints))
  
  return newPoints
}

// 内部函数：更新连续登录天数
function updateConsecutiveLoginDays(userId: string): number {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 设置为今天的开始时间
    
    // 获取上次登录时间
    const lastLoginString = localStorage.getItem(USER_LAST_LOGIN_KEY)
    const lastLoginMap: Record<string, string> = lastLoginString ? JSON.parse(lastLoginString) : {}
    
    // 获取连续登录天数
    const consecutiveDaysString = localStorage.getItem(USER_CONSECUTIVE_DAYS_KEY)
    const consecutiveDaysMap: Record<string, number> = consecutiveDaysString ? JSON.parse(consecutiveDaysString) : {}
    
    let consecutiveDays = consecutiveDaysMap[userId] || 0
    
    // 如果有上次登录记录
    if (lastLoginMap[userId]) {
      const lastLogin = new Date(lastLoginMap[userId])
      lastLogin.setHours(0, 0, 0, 0) // 设置为那天的开始时间
      
      // 计算天数差
      const timeDiff = today.getTime() - lastLogin.getTime()
      const daysDiff = timeDiff / (1000 * 3600 * 24)
      
      if (daysDiff === 1) {
        // 连续登录
        consecutiveDays += 1
      } else if (daysDiff > 1) {
        // 中断了连续登录
        consecutiveDays = 1
      }
      // 如果是同一天登录，保持连续天数不变
    } else {
      // 第一次登录
      consecutiveDays = 1
    }
    
    // 更新上次登录时间和连续天数
    lastLoginMap[userId] = today.toISOString()
    consecutiveDaysMap[userId] = consecutiveDays
    
    localStorage.setItem(USER_LAST_LOGIN_KEY, JSON.stringify(lastLoginMap))
    localStorage.setItem(USER_CONSECUTIVE_DAYS_KEY, JSON.stringify(consecutiveDaysMap))
    
    return consecutiveDays
  } catch (error) {
    console.error('更新连续登录天数失败', error)
    return 1
  }
}

// 获取用户等级
export function getUserLevel(userId: string): UserLevel {
  const points = getUserPoints(userId)
  
  // 查找对应等级
  for (const level of USER_LEVELS) {
    if (points >= level.minPoints && points <= level.maxPoints) {
      return level
    }
  }
  
  // 默认返回最低等级
  return USER_LEVELS[0]
}

// 获取升级所需积分
export function getPointsToNextLevel(userId: string): { nextLevel: UserLevel | null, pointsNeeded: number } {
  const points = getUserPoints(userId)
  const currentLevel = getUserLevel(userId)
  
  // 查找下一个等级
  const currentLevelIndex = USER_LEVELS.findIndex(level => level.level === currentLevel.level)
  
  // 如果已经是最高等级
  if (currentLevelIndex === USER_LEVELS.length - 1) {
    return { nextLevel: null, pointsNeeded: 0 }
  }
  
  const nextLevel = USER_LEVELS[currentLevelIndex + 1]
  const pointsNeeded = nextLevel.minPoints - points
  
  return { nextLevel, pointsNeeded }
}

// 检查用户是否已经完成今日签到
export function hasCheckedInToday(userId: string): boolean {
  const activities = getUserActivities(userId)
  
  // 获取今天的开始时间
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 查找今天的签到记录
  return activities.some(activity => 
    activity.type === ActivityType.DAILY_CHECK && 
    activity.timestamp >= today
  )
}

// 执行每日签到
export function performDailyCheckIn(userId: string): number | null {
  if (hasCheckedInToday(userId)) {
    return null // 今天已经签到过了
  }
  
  return recordUserActivity(userId, ActivityType.DAILY_CHECK)
} 