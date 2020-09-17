<template>
	<view>
		<view v-for="(plan,planIndex) in plans" :key="planIndex">
			
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				plans:[]
			};
		}
	}
</script>

<style lang="scss">

</style>
