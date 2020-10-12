import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		/**
		 * 是否需要强制登录
		 */
		forcedLogin: false,
		hasLogin: false,
		nickname: "",
		avatar:'../../static/img/logo.png'
	},
	mutations: {
		login(state, profile) {
			state.nickname = profile.nickname || '新用户';
			state.avatar = profile.avatar;
			state.hasLogin = true;
			console.log('state:',state.nickname,state.avatar);
		},
		logout(state) {
			state.nickname = "";
			state.avatar = '../../static/img/logo.png';
			state.hasLogin = false;
			uni.removeStorageSync('token')
		}
	}
})

export default store
