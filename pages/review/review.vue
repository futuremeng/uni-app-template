<template>
	<view>
		<view class="lesson" v-if="lesson">
			<text>{{lesson.title}}</text>
			<text>{{lesson.creator}}</text>
			<view v-for="(audio,audioIndex) in lesson.audios" :key="audioIndex">
				示范：<button type="default" class="primary" @click="play(audio.src)">点击播放</button>
				<button type="warn" class="primary" v-if="lesson.isCreator">删除示范</button>
			</view>
			<view v-if="lesson.isCreator">
				<!-- 当是创建者的时候，则视为老师-->
				<button type="primary" class="primary">
					<text v-if="!lesson.audios||lesson.audios.length===0">录制示范</text>
					<text v-else>重新录制</text>
				</button>
			</view>
			<view v-else>
				<!-- 学生模式 -->
				<view v-if="!lesson.myReviews||lesson.myReviews.length===0">
					<tex>你还没有提交回课</tex>
					<view v-for="(myTempReview,myTempReviewIndex) in lesson.myTempReviews" :key="myTempReviewIndex">
						<view>
							<button type="default" class="primary" @click="play(myTempReviewIndex.src)">点击播放</button>
							<button type="warn" class="primary">删除回课</button>
						</view>
					</view>
					<view v-if="!lesson.myTempReviews||lesson.myTempReviews.length===0">
						<button type="primary" class="primary">录制回课</button>
					</view>
					<view v-else>
						<button type="primary" class="primary">提交回课</button>
						<button type="primary" class="primary">重新录制</button>
					</view>
				</view>
				<view v-else>
					<text>我的回课</text>
					<view v-for="(myReview,myReviewIndex) in lesson.myReviews" :key="myReviewIndex">
						<view>
							<button type="default" class="primary" @click="play(myReview.src)">点击播放</button>
						</view>
						<view>
							老师评价：
						</view>
					</view>
				</view>
			</view>
			<view>
				<view v-if="lesson.isCreator||lesson.isOpenCount">
					回课：N/Sum
				</view>
				<view v-if="lesson.isCreator">
					<switch :checked="lesson.isOpenCount" />公开回课统计
				</view>
			</view>
			<view>
				<!-- 创建者设置了开放review时，可以看到其他人的reviews -->
				<view v-if="lesson.isCreator||lesson.isOpenReviews">
					<view v-for="(otherReview,otherReviewIndex) in lesson.otherReviews" :key="otherReviewIndex">
						<button type="default" class="primary" @click="play(otherReview.src)">点击播放</button>
					</view>
				</view>
				<view v-if="lesson.isCreator">
					<switch :checked="lesson.isOpenReviews" />公开回课记录
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				lesson: null
			};
		},
		methods: {
			play(src) {
				const innerAudioContext = uni.createInnerAudioContext();
				innerAudioContext.autoplay = true;
				innerAudioContext.src = src;
				innerAudioContext.onPlay(() => {
					console.log('开始播放');
				});
				innerAudioContext.onError((res) => {
					console.log(res.errMsg);
					console.log(res.errCode);
				});

			}
		},
		onLoad(option) {
			console.log(option.id)
			this.lesson = {
				title: "第一页",
				creator: "作者",
				audios: [{
					src: "https://img-cdn-qiniu.dcloud.net.cn/uniapp/audio/music.mp3"
				}],
				isCreator: true,
				isOpenCount: true,
				isOpenReviews: true
			}
		}
	}
</script>

<style lang="scss">

</style>
