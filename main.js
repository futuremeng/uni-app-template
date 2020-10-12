import Vue from 'vue'
import App from './App'

import store from './store'
import url_config from './common/config.js'
import Request from './luch-request/index.js' // 下载的插件
// import Request from 'luch-request' // 使用npm

const http = new Request({
	baseURL: url_config,
	custom: {
		auth: true
	},
});

http.interceptors.request.use((config) => { // 可使用async await 做异步操作
	config.header = {
		...config.header,
		// a: 1 // 演示拦截器header加参
	}
	if (config.custom.auth && !config.header.Authorization) {
		var token = uni.getStorageSync('token')
		if (!token) { // 如果token不存在，return Promise.reject(config) 会取消本次请求
			return Promise.reject(config)
		}
		config.header.Authorization ='Bearer '+ token
	}
	// if (config.custom.loading) {
	//  uni.showLoading()
	// }

	return config
}, config => { // 可使用async await 做异步操作
	return Promise.reject(config)
})


Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$http = http

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
