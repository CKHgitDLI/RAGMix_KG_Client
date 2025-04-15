/**
 * Created by chendaye666 on 17/8/5.
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export default new VueRouter({
	mode: 'history',
	linkActiveClass: 'is-active',
	scrollBehavior: () => ({
		y: 0
	}),
	routes: [{
		path: '/',
		component: require('../views/Main')
	}
]
})