var CoinData = {//金币场用到
    type: 0, //类型
    cost: 1, //获得每局消耗
    win: 2, //获得底分
    min: 3, //获得进入下限
    max: 4 //获得进入上限
}

var UserInfoUIType = {
    UIF_In_Home: 1,
    UIF_In_Play: 2,
};

var MatchWrongCode = {
    kCode_MatchFull:601,                //比赛人满
    kCode_MatchFeeShort:602,            //比赛费用不足
    kCode_NotInMatch: 603,              //玩家不在比赛中
    kCode_MatchExist: 604,              //比赛已存在
    kCode_MatchStopReg: 605,            //比赛停止报名
    kCode_MatchNotConfig: 606,          //比赛未配置
    kCode_AlreadyInMatch: 607,          //玩家已经在比赛中
    kCode_MatchNotExist: 608,           //比赛不存在
    kCode_MatchCreateLock: 609,         //比赛创建锁
    kCode_MatchCreateRedisLock: 610,    //比赛创建锁
    kCode_AlreadyInRoom: 38,            //已在好友房中
    kCode_OverMaxCount:613,             //达到最大场次
};

jsclient.isPst = UserInfoUIType.UIF_In_Home;

var BlockLayer = cc.Layer.extend({
    sprite: null,
    jsBind: {
        block: {
            _layout: [[1, 1], [0.5, 0.5], [0, 0], true]
        },
        szImg: {
            _layout: [[0.1, 0.1], [0.5, 0.5], [0, 0]]
            , loading: {
                _run: function () {
                    this.runAction(cc.repeatForever(cc.rotateBy(2, -360)));
                }
            }
        }
    },
    ctor: function () {
        this._super();
        var blockui = ccs.load(res.Block_json);
        ConnectUI2Logic(blockui.node, this.jsBind);
        this.addChild(blockui.node);
        jsclient.blockui = this;
        return true;
    }
    , onEnter: function () {
        this._super();
		jsclient.block=function()
		{
			if("undefined"!=typeof(jsclient.blockui)&& jsclient.blockui)jsclient.blockui.zIndex=1000;
		}
		jsclient.unblock=function()
		{
			if("undefined"!=typeof(jsclient.blockui)&& jsclient.blockui)jsclient.blockui.zIndex=-1000;
		}
		jsclient.unblock();
	}
});

function stopEffect(id) {
    if (cc.sys.OS_WINDOWS == cc.sys.os) {
        return;
    }
    cc.audioEngine.stopEffect(id);
}

function preloadEffect(sd) {
    jsb.AudioEngine.preload(sd, null);
}

function playEffect(sd) {
    if (cc.sys.OS_WINDOWS == cc.sys.os) {
        return;
    }
    mylog(sd);
    return cc.audioEngine.playEffect("res/sound/" + sd + ".mp3", false);
}
function playMusic(sd) {
    if (cc.sys.OS_WINDOWS == cc.sys.os) {
        return;
    }
    if (sd == "bgMain")//在游戏外
    {
        jsclient.isPst = UserInfoUIType.UIF_In_Home;
    }
    else//在游戏内
    {
        jsclient.isPst = UserInfoUIType.UIF_In_Play;
    }
    cc.audioEngine.stopMusic();
    cc.audioEngine.playMusic("res/sound/" + sd + ".mp3", true);
}



jsclient.restartGame = function () {
    if (jsclient.gamenet)jsclient.gamenet.disconnect();
    sendEvent("restartGame");
}
jsclient.onekeyRepairGame = function () {
    if (jsclient.gamenet)jsclient.gamenet.disconnect();
    var basePath = jsb.fileUtils.getWritablePath();
    // var time = new Date();
    // jsb.fileUtils.renameFile(basePath + "update/", basePath + "update_" + time.getTime() + "/");
    jsb.fileUtils.removeFile(basePath + "update/project.manifest");
    jsb.fileUtils.removeFile(basePath + "update/project.manifest.temp");
    jsclient.showMsg("是否重启游戏？",
        function () {
            if (cc.sys.OS_IOS == cc.sys.os) {
                sendEvent("restartGame");
            }
            else {
                cc.director.end();
            }
        }, function () {
        }
    );
}
jsclient.reportErrorCode = function (code) {
    var tempCode = code;
    var loginData = sys.localStorage.getItem("loginData");
    if (loginData) {
        loginData = JSON.parse(loginData);
        tempCode += ",uid:" + loginData.mail;
    }
    var xhr = cc.loader.getXMLHttpRequest();//网络断开原因，上传日志
    xhr.open("POST", "http://139.129.206.54:3000/gzmj?content=" + base64encode("netConnectFailed =" + tempCode));
    xhr.onreadystatechange = function () {
    };
    xhr.send();
}


function setEffectsVolume(v) {
    if(v<0)
    {
        var ev=sys.localStorage.getItem("EffectVolume");
        if(!ev) ev="0.5";
        v=parseFloat(ev);
    }
    else
    {
        sys.localStorage.setItem("EffectVolume",v);
    }
    cc.audioEngine.setEffectsVolume(v);
    return v;
}
function setMusicVolume(v) {
    if(v<0)
    {
        var ev=sys.localStorage.getItem("MusicVolume");
        if(!ev) ev="0.5";
        v=parseFloat(ev);
    }
    else
    {
        sys.localStorage.setItem("MusicVolume",v);
    }
    cc.audioEngine.setMusicVolume(v);
    return v;
}

jsclient.NetMsgQueue = [];
var JSScene = cc.Scene.extend({
    jsBind: {
        _event:{},
        _keyboard: {
            onKeyPressed: function (key, event) {
            },
            onKeyReleased: function (key, event) {
                if (key == 82) jsclient.restartGame();
            }
        }
    },
    startQueueNetMsg: function () {
        var sce = this;
        if (jsclient.NetMsgQueue.length > 0) {
            var ed = jsclient.NetMsgQueue[0];
            var dh = jsclient.netCallBack[ed[0]];
            Log("handle ..." + ed[0]);
            var handleData = dh[1](ed[1]);
            sce.runAction(cc.sequence(
                cc.delayTime(0.0001),
                cc.callFunc(function () {
                    Log("uievent " + ed[0]);
                    if (handleData != -1) sendEvent(ed[0], ed[1]);
                    Log("netdelay " + dh[0]);
                }),
                cc.delayTime(dh[0]),
                cc.callFunc(function () {
                    jsclient.NetMsgQueue.splice(0, 1);
                    if (jsclient.NetMsgQueue.length > 0) sce.startQueueNetMsg();
                })));
        }
    },
    onEnter: function () {
        this._super();
        setEffectsVolume(-1);
        setMusicVolume(-1);
        ConnectUI2Logic(this, this.jsBind);
        this.addChild(new BlockLayer());
        jsclient.Scene.addChild(new UpdateLayer());

        //回放中更改播放速度，在这需重置
        var scheduler = this.getScheduler();
        if(scheduler){
            scheduler.setTimeScale(1.0);
        }
    }
});
