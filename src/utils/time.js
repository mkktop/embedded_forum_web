/**
 * 时间格式化工具函数
 * 支持相对时间和绝对时间两种格式
 */

/**
 * 格式化时间为相对时间或绝对时间
 * @param {string|Date} time - 时间字符串或 Date 对象
 * @param {Object} options - 格式化选项
 * @param {boolean} options.relative - 是否使用相对时间格式，默认 true
 * @param {string} options.format - 绝对时间格式模板，默认 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, options = {}) {
  if (!time) return '-'
  
  const date = typeof time === 'string' ? new Date(time) : time
  if (isNaN(date.getTime())) return '-'
  
  const { relative = true, format = 'YYYY-MM-DD HH:mm' } = options
  
  if (relative) {
    return formatRelativeTime(date)
  }
  
  return formatAbsoluteTime(date, format)
}

/**
 * 格式化为相对时间
 * @param {Date} date - 日期对象
 * @returns {string} 相对时间字符串
 */
function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - date
  
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }
  
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  if (year === now.getFullYear()) {
    return `${month}-${day}`
  }
  
  return `${year}-${month}-${day}`
}

/**
 * 格式化为绝对时间
 * @param {Date} date - 日期对象
 * @param {string} format - 格式模板
 * @returns {string} 绝对时间字符串
 */
function formatAbsoluteTime(date, format) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
