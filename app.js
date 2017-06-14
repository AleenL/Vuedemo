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
  weatherList:[],
	currentUser:null,
  weatherShow:false,
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
    getWeather:function(){
      if(!this.weatherShow){
        
        $(this.$refs.rightContent).css({'width':'150px','marginLeft':'-150px'})
        $(this.$refs.middleContent).animate({marginRight:'150px'},880)  
        this.weatherShow = true
      }else{
        $(this.$refs.rightContent).css({'width':'0px','marginLeft':'0px'})
        $(this.$refs.middleContent).animate({marginRight:'0px'},580) 
        this.weatherShow = true 
        this.weatherShow = false
      }
        let _this = this
        let cityUrl = "https://api.map.baidu.com/location/ip?ak=O6SDTtgTtymLR2UzklNO9eYolcZLXI7Q";
        $.ajax({
            url:cityUrl,
            type:'get',
            async: false,
            dataType: 'jsonp',
            success: function(data){
              var city = data.content.address
              $.ajax({
                url:"https://free-api.heweather.com/v5/now?",
                type:'get',
                data:{
                  key:'fd8448c857234882a4805160bd79c00e',
                  city:city
                },
                async: false,
                dataType: 'text',
                success:function(data){
                  data = $.parseJSON(data)
                  let _w = data.HeWeather5['0'].now.cond.txt
                  let bodywd = data.HeWeather5['0'].now.fl
                  let hum = data.HeWeather5['0'].now.hum
                  let wd = data.HeWeather5['0'].now.tmp+'℃'
                  let wind = data.HeWeather5['0'].now.wind.dir+' '+data.HeWeather5['0'].now.wind.sc+'级'
                  let logo = null,title=null
                  if(_w.indexOf('阴') != -1){
                    logo="<i class='iconfont'>&#xe60a;</i>"
                    title='阴天，在不开灯的房间'
                  }else if(_w.indexOf('雨') != -1){
                    logo="<i class='iconfont'>&#xe683;</i>"
                    title='下雨天，和巧克力更配哦'
                  }else if(_w.indexOf('晴') != -1){
                    logo="<i class='iconfont'>&#xe683;</i>"
                    title='故事的小黄花，你还记得吗？'
                  }
                   _this.weatherList.push(
                    {city:city,
                    weath:_w,
                    cloud:wind,
                    qiwen:wd,
                    logo:logo,
                    title:title
                    })
                },
                error:function(error){
                  alert(error)
                }
              })
            }
          })
        this.weatherList=[];
    },
    chooseStyle:function(){
      if(this.$refs.choose_style.style.width === '100px'){
        this.$refs.choose_style.style.width = 0
      }else{
        this.$refs.choose_style.style.width = '100px'
      }
    },
    chooseColor:function(e){
      let backgroundColor = document.getElementsByClassName('background_color')
      for(var i=0;i<backgroundColor.length;i++){
       backgroundColor[i].style.backgroundColor=$(e.target).attr('data-color')
      }
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
      if(this.newTodo == "") return
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
