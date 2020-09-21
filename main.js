import Vue from 'vue'
import App from './App'

import store from './store'
import url from './common/config.js'
import Request from './luch-request/index.js' // 下载的插件
// import Request from 'luch-request' // 使用npm

const http = new Request();

Vue.config.productionTip = false

Vue.prototype.$store = store
Vue.prototype.$url = url
Vue.prototype.$http = http

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()
