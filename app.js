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
   	this.fetchTodos()
   },
   methods:{
   	fetchTodos:function(){
   		if(this.currentUser){
   		var query = new AV.Query('AllTodos')
   		query.find().then((todos) => {
   			let avAllTodos = todos[0]
   			let id = avAllTodos.id
   			this.todoList = JSON.parse(avAllTodos.attributes.content)
   			this.todoList.id = id
   		},function(error){
   			console.log(error)
   			})
   		}
   	},
   	updataTodos:function(){
   		let dataString = JSON.stringify(this.todoList)
   		let avTodos = AV.Object.createWithoutData('AllTodos',this.todoList.id)
		avTodos.set('content',dataString)
		avTodos.save().then(()=>{
			console.log('更新成功')
		})   	
   	},

   	saveTodos:function(){
   		let dataString = JSON.stringify(this.todoList)
   		var AVTodos = AV.Object.extend('AllTodos');
   		var avTodos = new AVTodos();
   		var acl = new AV.ACL()
   		acl.setReadAccess(AV.User.current(),true)
   		acl.setWriteAccess(AV.User.current(),true)
   		avTodos.set('content', dataString);
   		avTodos.setACL(acl)
       	avTodos.save().then((todo)=>{
       		this.todoList.id = todo.id
       		console.log('save finish')
       	},function(error){
       		console.log('save filed')
       	})
   	},
   	saveOrUpdateTodos: function(){
   		if(this.todoList.id){
   			this.updataTodos()
   		}else{
   			this.saveTodos()
   		}
   	},
   	addTodo:function(){
   		this.todoList.push({
   			title:this.newTodo,
   			createdAt:new Date(),
   			done:false
   		})
   		this.newTodo = ''
   		this.saveOrUpdateTodos()
   	},
   	removeTodo:function(todo){
   		let index = this.todoList.indexOf(todo)
   		this.todoList.splice(index,1)
   		this.saveOrUpdateTodos()
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
   			this.fetchTodos()
   		},function(error){});
   			
   	},
   	getCurrentUser: function(){
   		let current = AV.User.current()
   		if(current){
   		let {id,createdAt,attributes:{username}} = current
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
