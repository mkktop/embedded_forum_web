/**
 * API接口定义模块
 * 功能：封装所有后端API接口，统一管理接口调用
 */
import request from './request'

/**
 * 认证相关API
 * 包含：登录、注册、获取用户信息、更新资料、修改密码
 */
export const authApi = {
  /**
   * 用户登录
   * @param {Object} data - 登录数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @returns {Promise<Object>} 登录结果，包含token和用户信息
   */
  login(data) {
    return request.post('/login', data)
  },

  /**
   * 用户注册
   * @param {Object} data - 注册数据
   * @param {string} data.username - 用户名（4-20字符）
   * @param {string} data.password - 密码（6-20字符）
   * @param {string} data.email - 邮箱
   * @param {string} data.invite_code - 邀请码
   * @returns {Promise<Object>} 注册结果，包含token和用户信息
   */
  register(data) {
    return request.post('/register', data)
  },

  /**
   * 获取当前登录用户信息
   * @returns {Promise<Object>} 用户详细信息
   */
  getUserInfo() {
    return request.get('/user/info')
  },

  /**
   * 更新用户资料
   * @param {Object} data - 资料数据
   * @param {string} [data.nickname] - 昵称
   * @param {string} [data.avatar] - 头像URL
   * @param {string} [data.signature] - 个性签名
   * @returns {Promise<Object>} 更新结果
   */
  updateProfile(data) {
    return request.put('/user/profile', data)
  },

  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.old_password - 原密码
   * @param {string} data.new_password - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  changePassword(data) {
    return request.put('/user/password', data)
  }
}

/**
 * 帖子相关API
 * 包含：帖子列表、详情、发布、更新、删除、点赞、收藏
 */
export const postApi = {
  /**
   * 获取帖子列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.pageSize] - 每页数量
   * @param {number} [params.category_id] - 版块ID
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.orderBy] - 排序方式（latest/popular/pinned）
   * @returns {Promise<Object>} 帖子列表和分页信息
   */
  getList(params) {
    return request.get('/posts', { params })
  },

  /**
   * 获取帖子详情
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 帖子详细信息
   */
  getDetail(id) {
    return request.get(`/posts/${id}`)
  },

  /**
   * 发布帖子
   * @param {Object} data - 帖子数据
   * @param {string} data.title - 标题
   * @param {string} data.content - 内容
   * @param {number} data.category_id - 版块ID
   * @returns {Promise<Object>} 发布结果
   */
  create(data) {
    return request.post('/posts', data)
  },

  /**
   * 更新帖子
   * @param {number} id - 帖子ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  update(id, data) {
    return request.put(`/posts/${id}`, data)
  },

  /**
   * 删除帖子
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 删除结果
   */
  delete(id) {
    return request.delete(`/posts/${id}`)
  },

  /**
   * 获取我的帖子列表
   * @returns {Promise<Object>} 我的帖子列表
   */
  getMyPosts() {
    return request.get('/posts/my')
  },

  /**
   * 获取帖子统计信息
   * @returns {Promise<Object>} 统计数据
   */
  getStats() {
    return request.get('/posts/stats')
  },

  /**
   * 点赞帖子
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 点赞结果
   */
  like(id) {
    return request.post(`/posts/${id}/like`)
  },

  /**
   * 取消点赞
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 取消结果
   */
  unlike(id) {
    return request.delete(`/posts/${id}/like`)
  },

  /**
   * 收藏帖子
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 收藏结果
   */
  favorite(id) {
    return request.post(`/posts/${id}/favorite`)
  },

  /**
   * 取消收藏
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 取消结果
   */
  unfavorite(id) {
    return request.delete(`/posts/${id}/favorite`)
  },

  /**
   * 获取帖子的点赞/收藏状态
   * @param {number} id - 帖子ID
   * @returns {Promise<Object>} 状态信息 {liked, favorited}
   */
  getStatus(id) {
    return request.get(`/posts/${id}/status`)
  }
}

/**
 * 评论相关API
 * 包含：评论列表、回复、发表、删除
 */
export const commentApi = {
  /**
   * 获取帖子评论列表
   * @param {number} postId - 帖子ID
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.pageSize] - 每页数量
   * @returns {Promise<Object>} 评论列表和分页信息
   */
  getList(postId, params) {
    return request.get(`/posts/${postId}/comments`, { params })
  },

  /**
   * 获取评论的回复列表
   * @param {number} commentId - 评论ID
   * @returns {Promise<Object>} 回复列表
   */
  getReplies(commentId) {
    return request.get(`/comments/${commentId}/replies`)
  },

  /**
   * 发表评论
   * @param {number} postId - 帖子ID
   * @param {Object} data - 评论数据
   * @param {string} data.content - 评论内容
   * @param {number} [data.parent_id] - 父评论ID（回复时使用）
   * @param {number} [data.reply_to_user_id] - 回复的用户ID
   * @returns {Promise<Object>} 发表结果
   */
  create(postId, data) {
    return request.post(`/posts/${postId}/comments`, data)
  },

  /**
   * 删除评论
   * @param {number} id - 评论ID
   * @returns {Promise<Object>} 删除结果
   */
  delete(id) {
    return request.delete(`/comments/${id}`)
  },

  /**
   * 获取我的评论列表
   * @returns {Promise<Object>} 我的评论列表
   */
  getMyComments() {
    return request.get('/user/comments')
  }
}

/**
 * 版块相关API
 * 包含：获取版块列表、版块详情
 */
export const categoryApi = {
  /**
   * 获取启用的版块列表
   * @returns {Promise<Object>} 版块列表
   */
  getActive() {
    return request.get('/categories/active')
  },

  /**
   * 获取版块详情
   * @param {number} id - 版块ID
   * @returns {Promise<Object>} 版块详细信息
   */
  getDetail(id) {
    return request.get(`/categories/${id}`)
  }
}

/**
 * 签到积分相关API
 * 包含：签到、签到状态、签到记录、积分信息、兑换邀请码
 */
export const signInApi = {
  /**
   * 执行签到
   * @returns {Promise<Object>} 签到结果，包含获得的积分和连续签到天数
   */
  signIn() {
    return request.post('/sign-in')
  },

  /**
   * 获取签到状态
   * @returns {Promise<Object>} 签到状态信息
   */
  getStatus() {
    return request.get('/sign-in/status')
  },

  /**
   * 获取签到记录
   * @returns {Promise<Object>} 签到记录列表
   */
  getRecords() {
    return request.get('/sign-in/records')
  },

  /**
   * 获取积分信息
   * @returns {Promise<Object>} 积分余额和兑换信息
   */
  getPoints() {
    return request.get('/sign-in/points')
  },

  /**
   * 兑换邀请码
   * @returns {Promise<Object>} 兑换结果，包含新的邀请码
   */
  exchangeInviteCode() {
    return request.post('/sign-in/points/exchange')
  }
}

/**
 * 用户个人数据相关API
 * 包含：收藏、点赞、购买记录、收益
 */
export const userApi = {
  /**
   * 获取我收藏的帖子列表
   * @returns {Promise<Object>} 收藏列表
   */
  getFavorites() {
    return request.get('/user/favorites')
  },

  /**
   * 获取我点赞的帖子列表
   * @returns {Promise<Object>} 点赞列表
   */
  getLikes() {
    return request.get('/user/likes')
  },

  /**
   * 获取我的资源购买记录
   * @returns {Promise<Object>} 购买记录列表
   */
  getPurchases() {
    return request.get('/user/purchases')
  },

  /**
   * 获取我的资源收益
   * @returns {Promise<Object>} 收益信息
   */
  getEarnings() {
    return request.get('/user/earnings')
  }
}

/**
 * 资源下载相关API
 * 包含：资源信息、设置资源、购买资源、删除资源
 */
export const resourceApi = {
  /**
   * 获取帖子资源信息
   * @param {number} postId - 帖子ID
   * @returns {Promise<Object>} 资源信息，包含价格、是否已购买等
   */
  get(postId) {
    return request.get(`/posts/${postId}/resource`)
  },

  /**
   * 设置帖子资源（作者或管理员）
   * @param {number} postId - 帖子ID
   * @param {Object} data - 资源数据
   * @param {string} data.download_link - 下载链接
   * @param {number} [data.price] - 价格（默认50积分）
   * @returns {Promise<Object>} 设置结果
   */
  set(postId, data) {
    return request.post(`/posts/${postId}/resource`, data)
  },

  /**
   * 购买资源
   * @param {number} postId - 帖子ID
   * @returns {Promise<Object>} 购买结果，包含下载链接
   */
  purchase(postId) {
    return request.post(`/posts/${postId}/resource/purchase`)
  },

  /**
   * 删除资源
   * @param {number} postId - 帖子ID
   * @returns {Promise<Object>} 删除结果
   */
  delete(postId) {
    return request.delete(`/posts/${postId}/resource`)
  },

  /**
   * 获取资源统计信息
   * @param {number} postId - 帖子ID
   * @returns {Promise<Object>} 统计数据
   */
  getStats(postId) {
    return request.get(`/posts/${postId}/resource/stats`)
  }
}

/**
 * 管理员相关API
 * 包含：数据面板、用户管理、帖子管理、评论管理、邀请码管理、版块管理
 */
export const adminApi = {
  /**
   * 获取管理后台数据面板
   * @returns {Promise<Object>} 统计数据概览
   */
  getDashboard() {
    return request.get('/admin/dashboard')
  },

  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page] - 页码
   * @param {number} [params.pageSize] - 每页数量
   * @param {string} [params.role] - 角色筛选
   * @param {number} [params.status] - 状态筛选
   * @param {string} [params.keyword] - 搜索关键词
   * @returns {Promise<Object>} 用户列表和分页信息
   */
  getUsers(params) {
    return request.get('/admin/users', { params })
  },

  /**
   * 获取用户详情
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} 用户详细信息
   */
  getUserDetail(id) {
    return request.get(`/admin/users/${id}`)
  },

  /**
   * 更新用户状态
   * @param {number} id - 用户ID
   * @param {number} status - 状态（0:禁用 1:正常）
   * @returns {Promise<Object>} 更新结果
   */
  updateUserStatus(id, status) {
    return request.put(`/admin/users/${id}/status`, { status })
  },

  /**
   * 更新用户角色
   * @param {number} id - 用户ID
   * @param {string} role - 角色（admin/user）
   * @returns {Promise<Object>} 更新结果
   */
  updateUserRole(id, role) {
    return request.put(`/admin/users/${id}/role`, { role })
  },

  /**
   * 获取所有帖子（含已删除）
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 帖子列表
   */
  getPosts(params) {
    return request.get('/admin/posts', { params })
  },

  /**
   * 更新帖子状态
   * @param {number} id - 帖子ID
   * @param {number} status - 状态（0:已删除 1:正常 2:审核中）
   * @returns {Promise<Object>} 更新结果
   */
  updatePostStatus(id, status) {
    return request.put(`/admin/posts/${id}/status`, { status })
  },

  /**
   * 获取所有评论
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 评论列表
   */
  getComments(params) {
    return request.get('/admin/comments', { params })
  },

  /**
   * 删除评论
   * @param {number} id - 评论ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteComment(id) {
    return request.delete(`/admin/comments/${id}`)
  },

  /**
   * 置顶帖子
   * @param {number} id - 帖子ID
   * @param {number} isPinned - 是否置顶（0:否 1:是）
   * @returns {Promise<Object>} 操作结果
   */
  pinPost(id, isPinned) {
    return request.put(`/posts/${id}/pin`, { is_pinned: isPinned })
  },

  /**
   * 加精帖子
   * @param {number} id - 帖子ID
   * @param {number} isHighlighted - 是否加精（0:否 1:是）
   * @returns {Promise<Object>} 操作结果
   */
  highlightPost(id, isHighlighted) {
    return request.put(`/posts/${id}/highlight`, { is_highlighted: isHighlighted })
  },

  /**
   * 批量生成邀请码
   * @param {number} count - 生成数量
   * @returns {Promise<Object>} 生成的邀请码列表
   */
  createInviteCodes(count) {
    return request.post('/invite-codes', { count })
  },

  /**
   * 获取邀请码列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 邀请码列表
   */
  getInviteCodes(params) {
    return request.get('/invite-codes', { params })
  },

  /**
   * 删除邀请码
   * @param {number} id - 邀请码ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteInviteCode(id) {
    return request.delete(`/invite-codes/${id}`)
  },

  /**
   * 创建版块
   * @param {Object} data - 版块数据
   * @param {string} data.name - 版块名称
   * @param {string} [data.description] - 版块描述
   * @param {string} [data.icon] - 图标URL
   * @returns {Promise<Object>} 创建结果
   */
  createCategory(data) {
    return request.post('/categories', data)
  },

  /**
   * 更新版块
   * @param {number} id - 版块ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  updateCategory(id, data) {
    return request.put(`/categories/${id}`, data)
  },

  /**
   * 删除版块
   * @param {number} id - 版块ID
   * @returns {Promise<Object>} 删除结果
   */
  deleteCategory(id) {
    return request.delete(`/categories/${id}`)
  }
}

/**
 * 系统相关API
 * 包含：服务器时间、系统信息
 */
export const systemApi = {
  /**
   * 获取服务器时间
   * @returns {Promise<Object>} 时间戳和格式化时间
   */
  getTime() {
    return request.get('/system/time')
  },

  /**
   * 获取系统信息
   * @returns {Promise<Object>} 系统名称、版本、Node版本
   */
  getInfo() {
    return request.get('/system/info')
  }
}
