(function(){
    HomeLayer = cc.Layer.extend({
        jsBind:{
            back:{
                _layout:[[1,1],[0.5,0.5],[0,0],true],
                type1Btn:{
                    _click:function(){
                        Log("Home.js type1Btn onclick");
                    }
                },
                type2Btn:{
                    _click:function(){
                        Log("Home.js type2Btn onclick");
                    }
                }
            }
        },
        ctor: function () {
            this._super();
            var homeui = ccs.load(res.Home_json);
            ConnectUI2Logic(homeui.node,this.jsBind);
            this.addChild(homeui.node);
            return true;
        }
    });
})();