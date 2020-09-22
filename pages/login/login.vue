<template>
	<view class="content">
		<!-- <view class="login-type">
			<view v-for="(item,index) in loginTypeList" :key="index" @click="loginType = index" :class="{act: loginType === index}"
			 class="login-type-btn">{{item}}</view>
		</view> -->
		<!-- <view class="input-group" v-if="loginType === 0">
			<view class="input-row border">
				<text class="title">账号：</text>
				<m-input class="m-input" type="text" clearable focus v-model="username" placeholder="请输入账号"></m-input>
			</view>
			<view class="input-row">
				<text class="title">密码：</text>
				<m-input type="password" displayable v-model="password" placeholder="请输入密码"></m-input>
			</view>
		</view> -->
		<!-- <view class="input-group" v-else>
			<view class="input-row border">
				<text class="title">手机：</text>
				<m-input class="m-input" type="text" clearable focus v-model="mobile" placeholder="请输入手机号码"></m-input>
			</view>
			<view class="input-row">
				<text class="title">验证码：</text>
				<m-input type="text" v-model="code" placeholder="请输入验证码"></m-input>
				<view class="send-code-btn" @click="sendSmsCode">{{codeDuration ? codeDuration + 's' : '发送验证码' }}</view>
			</view>
		</view> -->
		<!-- <view class="btn-row">
			<button type="primary" class="primary" @tap="bindLogin">登录</button>
		</view> -->
		<!-- <view class="action-row">
			<navigator url="../reg/reg">注册账号</navigator>
			<text>|</text>
			<navigator url="../pwd/pwd">忘记密码</navigator>
		</view> -->
		<view>
			<!-- #ifdef MP-WEIXIN -->
			<view v-if="isCanUse">
				<view>
					<view class='header'>
						<image src='../../static/img/wx_login.png'></image>
					</view>
					<view class='content'>
						<view>申请获取以下权限</view>
						<text>获得你的公开信息(昵称，头像、地区等)</text>
					</view>

					<button class='bottom' type='primary' open-type="getUserInfo" withCredentials="true" lang="zh_CN" @getuserinfo="wxGetUserInfo">
						授权登录
					</button>
				</view>
			</view>
			<!-- #endif -->
		</view>
		<view>
			<view>隐私声明：“英语回课”不获取个人信息，仅使用微信openid作为区分用户的依据。</view>
			<view>请点击下方按钮授权</view>
		</view>
		<view class="oauth-row" v-if="hasProvider" v-bind:style="{top: positionTop + 'px'}">
			<view class="oauth-image" v-for="provider in providerList" :key="provider.value">
				<image :src="provider.image" @tap="oauth(provider.value)"></image>
				<!-- #ifdef MP-WEIXIN -->
				<button v-if="!isDevtools" open-type="getUserInfo" @getuserinfo="wxGetUserInfo"></button>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import service from '../../service.js';
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import mInput from '../../components/m-input.vue'

	export default {
		components: {
			mInput
		},
		data() {
			return {
				isCanUse: uni.getStorageSync('isCanUse') || true, //默认为true
				loginType: 0,
				loginTypeList: ['密码登录', '免密登录'],
				mobile: '',
				code: '',
				providerList: [],
				hasProvider: false,
				username: '',
				password: '',
				positionTop: 0,
				isDevtools: false,
				codeDuration: 0
			}
		},
		computed: mapState(['forcedLogin']),
		methods: {
			...mapMutations(['login']),
			initProvider() {
				const filters = ['weixin', 'qq', 'sinaweibo'];
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						if (res.provider && res.provider.length) {
							for (let i = 0; i < res.provider.length; i++) {
								if (~filters.indexOf(res.provider[i])) {
									this.providerList.push({
										value: res.provider[i],
										image: '../../static/img/' + res.provider[i] + '.png'
									});
								}
							}
							this.hasProvider = true;
						}
					},
					fail: (err) => {
						console.error('获取服务供应商失败：' + JSON.stringify(err));
					}
				});
			},
			initPosition() {
				/**
				 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
				 * 反向使用 top 进行定位，可以避免此问题。
				 */
				this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
			},
			oauth(provider) {
				console.log('login by ', provider);
				uni.showLoading({
					title: '登录中...'
				});
				let _this = this;
				uni.login({
					provider: provider,
					success: (oauthRes) => {
						console.log('res:', oauthRes);
						// {errMsg: "login:ok",code: "091Tvgll2QppF54NI5ml27XtSs1TvglM"}
						console.log('code:', oauthRes.code);
						_this.$http.post('auth/code', {
							code: oauthRes.code
						}, {
							custom: {
								auth: false
							},
						}).then(codeRes => {
							console.log('codeRes', codeRes)
							uni.setStorageSync('token', codeRes.data.data.token)
							_this.updateUserInfo(provider);
							uni.hideLoading();
						}).catch(authCodeErr => {
							console.log(authCodeErr)
						})

					},
					fail: (err) => {
						console.error('授权登录失败：' + JSON.stringify(err));
						uni.hideLoading();
					}
				});
			},
			//第一授权获取用户信息===》按钮触发
			wxGetUserInfo({
				detail
			}) {
				if (detail.userInfo) {
					console.log(detail);
					try {
						uni.setStorageSync('isCanUse', false); //记录是否第一次授权  false:表示不是第一次授权
						this.oauth('weixin');
					} catch (e) {

					}
				} else {
					uni.showToast({
						icon: 'none',
						title: '登录失败'
					});
				}
			},
			loginLocal(user) {
				uni.setStorageSync('login_type', 'local')
				uni.setStorageSync('username', user.nickName)
				uni.setStorageSync('avatarUrl', user.avatarUrl)
				this.toMain(user.nickName);
			},
			toMain(userName) {
				this.login(userName);
				/**
				 * 强制登录时使用reLaunch方式跳转过来
				 * 返回首页也使用reLaunch方式
				 */
				if (this.forcedLogin) {
					uni.reLaunch({
						url: '../main/main',
					});
				} else {
					uni.navigateBack();
				}

			},
			//获取最新的用户信息并向后台更新信息，（同时更新token，因后台更新用户信息时更新了token）
			updateUserInfo(provider) {
				let _this = this;
				uni.getUserInfo({
					provider: provider,
					success: (infoRes) => {
						/**
						 * 实际开发中，获取用户信息后，需要将信息上报至服务端。
						 */
						console.log('infoRes', infoRes);
						_this.$http.post('auth', {
							iv: infoRes.iv,
							encryptedData: infoRes.encryptedData,
							nickName: infoRes.userInfo.nickName,
							avatarUrl: infoRes.userInfo.avatarUrl
						}).then(authRes => {
							console.log('authRes', authRes)
							uni.setStorageSync('token', authRes.data.data.token)
							_this.loginLocal(authRes.data.data.user);
						}).catch(authErr => {
							console.log(authErr)
						})

					},
					fail() {
						uni.showToast({
							icon: 'none',
							title: '登录失败'
						});
					}
				});
			},
			// sendSmsCode() {
			// 	if(this.codeDuration) {
			// 		uni.showModal({
			// 			content: `请在${this.codeDuration}秒后重试`,
			// 			showCancel: false
			// 		})
			// 	}
			// 	if (!/^1\d{10}$/.test(this.mobile)) {
			// 		uni.showModal({
			// 			content: '手机号码填写错误',
			// 			showCancel: false
			// 		})
			// 		return
			// 	}
			// 	uniCloud.callFunction({
			// 		name: 'user-center',
			// 		data: {
			// 			action: 'sendSmsCode',
			// 			params: {
			// 				mobile: this.mobile
			// 			}
			// 		},
			// 		success: (e) => {
			// 			if (e.result.code == 0) {
			// 				uni.showModal({
			// 					content: '验证码发送成功，请注意查收',
			// 					showCancel: false
			// 				})
			// 				this.codeDuration = 60
			// 				this.codeInterVal = setInterval(() => {
			// 					this.codeDuration--
			// 					if (this.codeDuration === 0) {
			// 						if (this.codeInterVal) {
			// 							clearInterval(this.codeInterVal)
			// 							this.codeInterVal = null
			// 						}
			// 					}
			// 				}, 1000)
			// 			} else {
			// 				uni.showModal({
			// 					content: '验证码发送失败：' + e.result.msg,
			// 					showCancel: false
			// 				})
			// 			}
			
			// 		},
			// 		fail(e) {
			// 			uni.showModal({
			// 				content: '验证码发送失败',
			// 				showCancel: false
			// 			})
			// 		}
			// 	})
			// },
			// loginByPwd() {
			// 	/**
			// 	 * 客户端对账号信息进行一些必要的校验。
			// 	 * 实际开发中，根据业务需要进行处理，这里仅做示例。
			// 	 */
			// 	if (this.username.length < 3) {
			// 		uni.showToast({
			// 			icon: 'none',
			// 			title: '账号最短为 3 个字符'
			// 		});
			// 		return;
			// 	}
			// 	if (this.password.length < 6) {
			// 		uni.showToast({
			// 			icon: 'none',
			// 			title: '密码最短为 6 个字符'
			// 		});
			// 		return;
			// 	}
			// 	const data = {
			// 		username: this.username,
			// 		password: this.password
			// 	};
			// 	let _self = this;
			
			// 	uniCloud.callFunction({
			// 		name: 'user-center',
			// 		data: {
			// 			action: 'login',
			// 			params: data
			// 		},
			// 		success: (e) => {
			
			// 			console.log('login success', e);
			
			// 			if (e.result.code == 0) {
			// 				uni.setStorageSync('uniIdToken', e.result.token)
			// 				uni.setStorageSync('username', e.result.username)
			// 				uni.setStorageSync('login_type', 'online')
			// 				_self.toMain(_self.username);
			// 			} else {
			// 				uni.showModal({
			// 					content: e.result.msg,
			// 					showCancel: false
			// 				})
			// 				console.log('登录失败', e);
			// 			}
			
			// 		},
			// 		fail(e) {
			// 			uni.showModal({
			// 				content: JSON.stringify(e),
			// 				showCancel: false
			// 			})
			// 		}
			// 	})
			// },
			// loginBySms() {
			// 	if (!/^1\d{10}$/.test(this.mobile)) {
			// 		uni.showModal({
			// 			content: '手机号码填写错误',
			// 			showCancel: false
			// 		})
			// 		return
			// 	}
			// 	if (!/^\d{6}$/.test(this.code)) {
			// 		uni.showModal({
			// 			title: '验证码为6位纯数字',
			// 			showCancel: false
			// 		});
			// 		return;
			// 	}
			// 	let _self = this;
			
			// 	uniCloud.callFunction({
			// 		name: 'user-center',
			// 		data: {
			// 			action: 'loginBySms',
			// 			params: {
			// 				mobile: this.mobile,
			// 				code: this.code
			// 			}
			// 		},
			// 		success: (e) => {
			
			// 			console.log('login success', e);
			
			// 			if (e.result.code == 0) {
			// 				const username = e.result.username || '新用户'
			// 				uni.setStorageSync('uniIdToken', e.result.token)
			// 				uni.setStorageSync('username', username)
			// 				uni.setStorageSync('login_type', 'online')
			// 				_self.toMain(username);
			// 			} else {
			// 				uni.showModal({
			// 					content: e.result.msg,
			// 					showCancel: false
			// 				})
			// 				console.log('登录失败', e);
			// 			}
			
			// 		},
			// 		fail(e) {
			// 			uni.showModal({
			// 				content: JSON.stringify(e),
			// 				showCancel: false
			// 			})
			// 		}
			// 	})
			// },
			// bindLogin() {
			// 	switch (this.loginType) {
			// 		case 0:
			// 			this.loginByPwd()
			// 			break;
			// 		case 1:
			// 			this.loginBySms()
			// 			break;
			// 		default:
			// 			break;
			// 	}
			// },
		},
		onLoad() {
			//默认加载
			this.initPosition();
			this.initProvider();
			// #ifdef MP-WEIXIN
			this.isDevtools = uni.getSystemInfoSync().platform === 'devtools';
			// #endif
		},
		onReady() {
			// #ifdef MP-WEIXIN
			this.oauth('weixin');
			// #endif
		},

	}
</script>

<style>
	.login-type {
		display: flex;
		justify-content: center;
	}

	.login-type-btn {
		line-height: 30px;
		margin: 0px 15px;
	}

	.login-type-btn.act {
		color: #0FAEFF;
		border-bottom: solid 1px #0FAEFF;
	}

	.send-code-btn {
		width: 120px;
		text-align: center;
		background-color: #0FAEFF;
		color: #FFFFFF;
	}

	.action-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.action-row navigator {
		color: #007aff;
		padding: 0 10px;
	}

	.oauth-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	.oauth-image {
		position: relative;
		width: 50px;
		height: 50px;
		border: 1px solid #dddddd;
		border-radius: 50px;
		margin: 0 20px;
		background-color: #ffffff;
	}

	.oauth-image image {
		width: 30px;
		height: 30px;
		margin: 10px;
	}

	.oauth-image button {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}

	.header {
		margin: 90rpx 0 90rpx 50rpx;
		border-bottom: 1px solid #ccc;
		text-align: center;
		width: 650rpx;
		height: 300rpx;
		line-height: 450rpx;
	}

	.header image {
		width: 200rpx;
		height: 200rpx;
	}

	.content {
		margin-left: 50rpx;
		margin-bottom: 90rpx;
	}

	.content text {
		display: block;
		color: #9d9d9d;
		margin-top: 40rpx;
	}

	.bottom {
		border-radius: 80rpx;
		margin: 70rpx 50rpx;
		font-size: 35rpx;
	}
</style>
