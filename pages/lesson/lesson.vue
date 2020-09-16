<template>
	<view>
		<view class="plan" v-if="plan">
			<view>当前plan的信息：{{plan.title}}</view>
			<view>创建者：{{plan.creator}}</view>
		</view>

		<!-- 当id为空时视为所有课程，不空时只加载指定plan的课程 -->
		<view class="lesson" v-for="(lesson,lessonIndex) in lessons" :key="lessonIndex">
			<view>{{lesson.title}}</view>
			<view>创建者：{{lesson.creator}}</view>
			<view v-if="lesson.isCreator">
				<!-- 当是创建者的时候，则视为老师，可以添加课程 -->
				<view>
					点评：N/SUM
				</view>
				<view>
					<button type="primary" class="primary" @click="toReview(lesson.id)">查看</button>
				</view>
			</view>
			<view v-else>
				<view v-if="lesson.isOpenCount">
					回课：N/SUM
				</view>
				<view>
					<button type="primary" class="primary" @click="toReview(lesson.id)">立即回课</button>
				</view>
			</view>
		</view>
		<view v-if="showCreateForm">
			<form @submit="formSubmit" @reset="formReset">
				<view class="uni-form-item uni-column">
					<view class="title">课程名称</view>
					<input class="uni-input" name="input" placeholder="请输入课程名称" />
				</view>
				<view class="uni-btn-v">
					<button form-type="submit">保存</button>
					<button type="default" form-type="reset">重置</button>
				</view>
			</form>
		</view>
		<view v-if="!plan||plan.isCreator">
			<button type="primary" class="primary" @click="showCreateForm=!showCreateForm">
				<text v-if="showCreateForm">放弃创建</text>
				<text v-else>+创建课程</text>
			</button>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				plan: {
					title: "本周回课计划",
					creator: "姓名",
					isCreator: true
				},
				lessons: [{
						id: 1,
						title: "第一页",
						creator: "姓名",
						isCreator: false,
						isOpenCount: true
					},
					{
						id: 2,
						title: "第二页",
						creator: "姓名",
						isCreator: true,
						isOpenCount: false
					}
				],
				showCreateForm: false
			};
		},
		methods: {
			createLesson() {

			},
			saveLesson() {

			},
			toReview(id) {
				uni.navigateTo({
					url: '/pages/review/review?id=' + id
				});
			}
		}
	}
</script>

<style lang="scss">
	.plan {
		font-size: 2rem;
	}

	.lesson {
		font-size: 1rem;
		margin-top: 2rem;
		margin-bottom: 2rem;
	}
</style>
