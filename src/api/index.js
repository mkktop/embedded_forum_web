import request from './request'

export const authApi = {
  login(data) {
    return request.post('/login', data)
  },

  register(data) {
    return request.post('/register', data)
  },

  getUserInfo() {
    return request.get('/user/info')
  },

  updateProfile(data) {
    return request.put('/user/profile', data)
  },

  changePassword(data) {
    return request.put('/user/password', data)
  }
}

export const postApi = {
  getList(params) {
    return request.get('/posts', { params })
  },

  getDetail(id) {
    return request.get(`/posts/${id}`)
  },

  create(data) {
    return request.post('/posts', data)
  },

  update(id, data) {
    return request.put(`/posts/${id}`, data)
  },

  delete(id) {
    return request.delete(`/posts/${id}`)
  },

  getMyPosts() {
    return request.get('/posts/my')
  },

  getStats() {
    return request.get('/posts/stats')
  },

  like(id) {
    return request.post(`/posts/${id}/like`)
  },

  unlike(id) {
    return request.delete(`/posts/${id}/like`)
  },

  favorite(id) {
    return request.post(`/posts/${id}/favorite`)
  },

  unfavorite(id) {
    return request.delete(`/posts/${id}/favorite`)
  },

  getStatus(id) {
    return request.get(`/posts/${id}/status`)
  }
}

export const commentApi = {
  getList(postId, params) {
    return request.get(`/posts/${postId}/comments`, { params })
  },

  getReplies(commentId) {
    return request.get(`/comments/${commentId}/replies`)
  },

  create(postId, data) {
    return request.post(`/posts/${postId}/comments`, data)
  },

  delete(id) {
    return request.delete(`/comments/${id}`)
  },

  getMyComments() {
    return request.get('/user/comments')
  }
}

export const categoryApi = {
  getActive() {
    return request.get('/categories/active')
  },

  getDetail(id) {
    return request.get(`/categories/${id}`)
  }
}

export const signInApi = {
  signIn() {
    return request.post('/sign-in')
  },

  getStatus() {
    return request.get('/sign-in/status')
  },

  getRecords() {
    return request.get('/sign-in/records')
  },

  getPoints() {
    return request.get('/sign-in/points')
  },

  exchangeInviteCode() {
    return request.post('/sign-in/points/exchange')
  }
}

export const userApi = {
  getFavorites() {
    return request.get('/user/favorites')
  },

  getLikes() {
    return request.get('/user/likes')
  },

  getPurchases() {
    return request.get('/user/purchases')
  },

  getEarnings() {
    return request.get('/user/earnings')
  }
}

export const resourceApi = {
  get(postId) {
    return request.get(`/posts/${postId}/resource`)
  },

  set(postId, data) {
    return request.post(`/posts/${postId}/resource`, data)
  },

  purchase(postId) {
    return request.post(`/posts/${postId}/resource/purchase`)
  },

  delete(postId) {
    return request.delete(`/posts/${postId}/resource`)
  },

  getStats(postId) {
    return request.get(`/posts/${postId}/resource/stats`)
  }
}

export const adminApi = {
  getDashboard() {
    return request.get('/admin/dashboard')
  },

  getUsers(params) {
    return request.get('/admin/users', { params })
  },

  getUserDetail(id) {
    return request.get(`/admin/users/${id}`)
  },

  updateUserStatus(id, status) {
    return request.put(`/admin/users/${id}/status`, { status })
  },

  updateUserRole(id, role) {
    return request.put(`/admin/users/${id}/role`, { role })
  },

  getPosts(params) {
    return request.get('/admin/posts', { params })
  },

  updatePostStatus(id, status) {
    return request.put(`/admin/posts/${id}/status`, { status })
  },

  getComments(params) {
    return request.get('/admin/comments', { params })
  },

  deleteComment(id) {
    return request.delete(`/admin/comments/${id}`)
  },

  pinPost(id, isPinned) {
    return request.put(`/posts/${id}/pin`, { is_pinned: isPinned })
  },

  highlightPost(id, isHighlighted) {
    return request.put(`/posts/${id}/highlight`, { is_highlighted: isHighlighted })
  },

  createInviteCodes(count) {
    return request.post('/invite-codes', { count })
  },

  getInviteCodes(params) {
    return request.get('/invite-codes', { params })
  },

  deleteInviteCode(id) {
    return request.delete(`/invite-codes/${id}`)
  },

  createCategory(data) {
    return request.post('/categories', data)
  },

  updateCategory(id, data) {
    return request.put(`/categories/${id}`, data)
  },

  deleteCategory(id) {
    return request.delete(`/categories/${id}`)
  }
}

export const systemApi = {
  getTime() {
    return request.get('/system/time')
  },

  getInfo() {
    return request.get('/system/info')
  }
}
