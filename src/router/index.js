import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Test from '@/components/test'
import Sketchpad from'@/components/Sketchpad'
import SketchGraph from'@/components/SketchGraph'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SketchGraph',
      component: SketchGraph
    },
     {
      path: '/test',
      name: 'Test',
      component: Test,
    },
    {
      path: '/sketchpad',
      name: 'Sketchpad',
      component: Sketchpad
    }
  ]
})
