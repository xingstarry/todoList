//index.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addBox: false,  // 添加todo的弹窗
    focus: false,   // input聚焦
    addText: '',    // input输入内容
    lists:[],
    curLists: [],   // 渲染输出列表
    status: '1',    // 默认显示‘全部’内容
    delBtnWidth:120  // 删除按钮的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    wx.getStorage({
      key: 'lists',
      success: function (res) {
        _this.setData({
          lists: res.data,
          curLists: res.data
        })
      },
    })
  },

  /*
   * 打开添加信息窗口
   */ 
  onAddShow(){
    this.setData({ 
      addBox:true,
      focus:true
    })
  },

  /*
   * 关闭添加信息窗口
   */
  closeAddShow() {
    this.setData({
      addBox: false, 
      focus: false,  
      addText:'',      
    })
  },

  /*
   * 实时获取输入的内容
   */
  setInput(e){
    this.setData({
      addText: e.detail.value
    })
  },

  /*
   * 添加新信息
   */
  addItem(){
    if (!this.data.addText.trim()){ //输入内容为空时不提交
      return
    }
    var item = this.data.lists;
    var newItem = {
      id:(new Date()).getTime(),
      title:this.data.addText,
      status:'0'
    }
    item.unshift(newItem);
    this.showCur(item);
    this.closeAddShow();
    wx: wx.setStorage({   // 保存到本地缓存中
      key: 'lists',
      data: item
    });
    wx:wx.showToast({   // 提示添加成功
      title: '添加成功',
      icon: 'success',
      duration: 1000
    })
  },
  /*
   * 给列表渲染赋值，展示赋值状态status对应curLists信息
   */
  showCur(data) {
    if (this.data.status === '1') {
      this.setData({
        lists: data,
        curLists: data
      })
    } else {     
      // var self = this;
      // curLists: data.filter(function (item) {
      //   return Number(item.status) === self.data.status - 2;
      // })
      // item => +item.status === (this.data.status - 2)
      this.setData({
        lists: data,
        curLists: data.filter(item => +item.status === (this.data.status - 2))
      })
    }
  },
  /*
   * 全部、未完成、已完成切换
   */
  showStatus: function (e) { 
    console.log(e)
    var st = e.currentTarget.dataset.status
    if (this.data.status === st) return
    if (st === '1') {
      this.setData({
        status: st,
        curLists: this.data.lists
      })
      return
    }
    // console.log(this.data.lists.filter(function (item) {
    //   return Number(item.status) === (st - 2)
    // }))
    this.setData({
      status: st,
      curLists: this.data.lists.filter(item => +item.status === (st - 2)) // 筛选状态status对应的信息
    })
  },
  /*
   * 点击按钮改变为 未完成|已完成
   */
  changeTodo(e){
    console.log(e)
    var _this = this;
    var item = e.currentTarget.dataset.item;
    var temp = _this.data.lists;
    temp.forEach((el,index)=>{
      if(el.id == item){
        if (el.status == '0') { // 状态改为0未完成时
          el.status = '1';    
          _this.showCur(temp);
          wx.setStorage({
            key: 'lists',
            data: temp,
          })
          wx.showToast({
            title: '已完成任务',
            icon:'success',
            duration:1000
          })
        }else{    // 状态为1已完成时
          wx.showModal({
            title: '',
            content: '该任务已完成，确定重新开始任务？',
            confirmText:'确定',
            cancelText:'不了',
            success(res){
              if(res.confirm){
                el.status = '0';
                _this.showCur(temp);
                wx.setStorage({
                  key: 'lists',
                  data: temp,
                })
              }else{
                console.log('不操作')
              }
            }
          })
        }
      }
    })

  },

  /*
   * 手指触屏
   */
  touchS(e){
    // console.log('触屏')
    var _this = this
    if(e.touches.length===1){ // 如果只有一个触点，获取他触点的x坐标
      _this.setData({
        startX: e.touches[0].clientX
      })
    }
  },
  /*
   * 手指滑动
   */
  touchM(e) {
    // console.log('滑动'+ JSON.stringify(e))
    var _this = this
    if(e.touches.length === 1){ // 只有一个手指
      // 获取移动后的x坐标
      var moveX = e.touches[0].clientX;
      // 获取移动前距离
      var startX = _this.data.startX;
      // 计算移动距离
      var disX = startX - moveX;
      // 获取删除按钮宽度
      var delBtnWidth = _this.data.delBtnWidth
      // 本条信息向左移动的距离
      var txtLeft = '';
      if (disX <= 0) {  // 移动距离小于0，文本位置不变
        txtLeft = 'left:0';
      } else if (disX>0){ // 移动距离大于0，文本位置向左移动手指移动距离
        txtLeft = 'left:-'+disX+'rpx';
        if (disX >= delBtnWidth){ // 移动距离大于删除按钮宽度，设置移动距离等于按钮宽度
          txtLeft = 'left:-' + delBtnWidth + 'rpx';
        }
      }
      // 获取手指触摸的是哪一条信息，index值
      var index = e.currentTarget.dataset.index;
      // 获取当前列表
      var list = _this.data.curLists;
      // 给这条添加样式
      list[index].txtLeft = txtLeft;
      // 赋值给curLists
      _this.setData({
        curLists:list
      })
    }
  },
  /*
   * 手指抬起
   */
  touchE(e) {
    // console.log('抬起');
    var _this = this;
    if (e.changedTouches.length ===1){ // 只有一个手指触屏
      // 手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      // 获取在屏幕移动的距离
      var disX = _this.data.startX - endX;
      // 获取删除按钮宽度
      var delBtnWidth = _this.data.delBtnWidth;
      // 如果滑动距离大于按钮1/2则显示按钮，否则不显示
      var txtLeft = disX > delBtnWidth / 2 ? 'left:-' + delBtnWidth + 'rpx' : 'left:0';
      // 获取list信息并赋值给它txtLeft，更新列表
      var index = e.currentTarget.dataset.index;
      var list = _this.data.curLists;
      list[index].txtLeft = txtLeft;
      _this.setData({ 
        curLists:list
      })
    }
  },
  /*
   * 点击删除按钮
   */
  delTodo(e){
    // console.log(e)
    var _this = this;
    // 获取要删除信息的item值
    var item = e.currentTarget.dataset.item;
    // 获取整个信息列表
    var temp = _this.data.lists;
    temp.forEach ((el,index) => {
      if(el.id == item){
        temp[index].txtLeft = 'left:0';
        wx.showModal({              // 删除提示
          title: '',
          content: '您确定要删除吗？',
          confirmText: "确定",
          cancelText: "考虑一下",
          success(res){ // 成功接收
            if(res.confirm){
              temp.splice(index,1) // 删除第index条信息
              _this.showCur(temp)  // 给列表重新渲染输出
              wx.setStorage({      // 保存到本地缓存中
                key: "lists",
                data: temp
              })
            }else{
              _this.showCur(temp)
              return console.log('不操作')
            }
          }
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})