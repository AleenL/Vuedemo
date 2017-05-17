import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID ='Q9GAeGSteenWAH9hvUYg91NN-gzGzoHsz';
var APP_KEY ='6atYF0seCGQD5QGtU18S3G0X';
AV.init({
	appId: APP_ID,
	appKey: APP_KEY
});


var app = new Vue({
  el: '#app',
  data: {
  	actionType:'signUp',
  	formData:{
  		username:'',
  		password:''
  	},
	newTodo:'',
	todoList:[],
	currentUser:null,
   },
   created:function(){
   	this.currentUser = this.getCurrentUser();
   },
   methods:{
   	saveTodos:function(){
   		let dataString = JSON.stringify(this.todoList)
   		var AVTodos = AV.Object.extend('AllTodos');
   		var avTodos = new AVTodos();
   		avTodos.set('content', dataString);
       	avTodos.save().then(function (todo) {
       		  // 成功保存之后，执行其他逻辑.
       		  console.log('保存成功');
       		}, function (error) {
       		  // 异常处理
       		  console.error('保存失败');
       		});
   	},
   	addTodo:function(){
   		this.todoList.push({
   			title:this.newTodo,
   			createdAt:new Date(),
   			done:false
   		})
   		this.newTodo = ''
   		this.saveTodos()
   	},
   	removeTodo:function(todo){
   		let index = this.todoList.indexOf(todo)
   		this.todoList.splice(index,1)
   		this.saveTodos()
   	},
   	signUp:function(){
   		let user = new AV.User();
   		user.setUsername(this.formData.username);
   		user.setPassword(this.formData.password);
   		user.signUp().then((loginedUser)=>{
   			this.currentUser = this.getCurrentUser()
   		},function(error){});
   	},
   	login:function(){
   		AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser)=>{
   			this.currentUser = this.getCurrentUser()
   			this.user = this.formData.username
   		},function(error){});
   	},
   	getCurrentUser: function(){
   		let current = AV.User.current()
   		if(current){
   		let {id,createdAt,attributes:{username}} = AV.User.current()
   		return {id,username,createdAt}
   		}else{
   			return null
   		}
   	},
   	logout: function(){
   		AV.User.logOut()
   		this.currentUser = null
   		window.location.reload()
   	}
   }
})
