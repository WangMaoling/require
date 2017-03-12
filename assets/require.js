var require = (function(){
    //框架版本基本信息
    var __BASEINFO__ = {
        __VERSION__ : "1.0.1",
        __AUTHORS__ : "WANGMAOLING",
        __GIT__ : "... "
    };

    // 设置默认路径
    var __DEFAULTS__ = {
        // 配置个常量 module_script 里面为用户自定义的js 把用户写的给包起来
        __EXPORTS__ : "(function(){var exports;{{module_script}};return exports;})();",
        main : "index.js",//默认入口文件
        path : "./node_module/"//默认路径
    };
   
    var __PROTOTYPE__ = {
        // 获取版本信息
        version : function(){
            return this.__VERSION__;
        },
        // 单独写个函数写文件路径,为了日后改起来方便
        file : function(module){
             // 改变this指向的方法
            return this.path+module+"/"+this.main;
        },
        load : function(module){
            //ajax 请求js内容 并想办法吧内容包装到闭包里面return出去，这样避免全局污染

            // (function(){var exports;{{module_script}}return exports;})();

            var oAjax = null;
            var _this = this;
            var _exports_ = null;//定义导出的对象，给个空
            var url = this.file(module);
            if(window.XMLHttpRequest){
                oAjax = new XMLHttpRequest();
            }else{
                oAjax = new ActiveXObject('Microsoft.XMLHTTP');
            }
            oAjax.onreadystatechange = function(){
                if(oAjax.readyState==4){
                    if(oAjax.status==200){
                        // 把module_script 替换为相应过来的文件内容
                        var _module_ = _this.__EXPORTS__.replace("{{module_script}}",oAjax.responseText);
                        _exports_ = eval(_module_);//执行以下 获取执行结果
                        // console.log(_exports_);
                    }
                }
            }
            // oAjax.open('GET', url, true);true 表示 ajax为异步请求,这里这样会报错，因为当页面请求返回时
            //_exports_还明没有响应过来 所以会返回null,所以要变成同步，一个执行完接着在执行
            oAjax.open('GET', url, false);
            oAjax.send();
            // console.log(_exports_);
            return _exports_;//返回执行后的结果，当调用 load 的时候就会返回结果
            // this.path+module+"/"+this.main;
            // console.log(this.file(module));
        }
    };

    //整个放在闭包里面，因为其他插件也有的有require 万一有冲突 只需改变最外面的名字即可；
    var __require = function(module){
        //调用load 改变this指向 写call方法只是为了加强理解  下面也可以 __require.load(module) 这样写
       // 当调用 __require的时候也就调用了 load 把结果返回出去
       return __require.load.call(__require,module);
        // console.log(this.path);
    }
    // 配置require全局参数
    __require.config = function(options){
        this.extend(options);
        // console.log(this.path);
    }
    // 扩展require函数对象的功能  或许有多个参数传进来 这里用了arguments
    __require.extend = function(){
        for(var i=0;i<arguments.length;i++){
            var obj = arguments[i];
            for(var prop in obj){
                this[prop] = obj[prop];
            }
        }
    }
    // 继承扩展 通过extend方法吧下面两个方法里面的属性方法 全部赋给了require
    __require.extend(__BASEINFO__,__DEFAULTS__,__PROTOTYPE__);
    return __require;
})();