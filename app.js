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
  	msg:'',
	newTodo:'',
	todoList:[],
	currentUser:null,
   },
   created:function(){
   	window.onbeforeunload = () =>{
   		let dataString = JSON.stringify(this.todoList)
   		var AVtodos = AV.object.extend('Alltodos');
   		var avTodos = new AVtodos();
   		avTodos.set('content',dataString);
   		avTodos.save().then(function(todo){
   			console.log('保存成功')
   		},function(error){
   			console.log("save failed")
   		})
   	}
   	let oldUser = window.localStorage.getItem('user')
   	let OldUsername = JSON.parse(oldUser)
   	this.user = OldUsername || ''
   	this.currentUser = this.getCurrentUser();
   },
   methods:{
   	addTodo:function(){
   		this.todoList.push({
   			title:this.newTodo,
   			createdAt:new Date(),
   			done:false
   		})
   		this.newTodo = ''
   	},
   	removeTodo:function(todo){
   		let index = this.todoList.indexOf(todo)
   		this.todoList.splice(index,1)
   	},
   	signUp:function(){
   		let user = new AV.User();
   		user.setUsername(this.formData.username);
   		user.setPassword(this.formData.password);
   		user.signUp().then((loginedUser)=>{
   			this.currentUser = this.getCurrentUser()
   			this.user = loginedUser.attributes.username
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
