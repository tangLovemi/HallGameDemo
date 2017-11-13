(function(){


	function allUpdateFinish(){
		Log("Update.js allUpdateFinish() begin");
	}


	var jindu = 1;
	function updateLoadingBar() {
		jindu++;
		if(jindu<=99) {
			if(jindu !=99){
				bar.setPercent(jindu);
			}
		}
		else {
			if(jindu>=100) {
				bar.setPercent(100);
				if(jsclient.updateFinishOK){
					//jsclient.updateui.unschedule(updateLoadingBar);
					allUpdateFinish();
				}
			}
		}
	}

	function setProgressPercent(p) {
		Log("Update.js setProgressPercent() p:" + p);
		if(p==100) {
		}
		else {
			bar.setPercent(p);
			sys.localStorage.setItem("NoticeCfg","1");
		}
	}
	function dotLoadAction(node) {
		var update_dian_ac_number = 1;
		var callback = function() {
			node.loadTexture("res/loading/dian"+update_dian_ac_number+".png");
			if(update_dian_ac_number  ==7) {
				update_dian_ac_number =1;
			}
			update_dian_ac_number++;
		};
		node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback),cc.DelayTime(0.3))));
	}
	function updateResFinish() {
		Log("Update.js updateFinish() begin");
		jsclient.updateFinishOK = true;
	}
	var manager,listener,bar;
	var updatePercent = 0;
	UpdateLayer = cc.Layer.extend({
		jsBind:{
			back: {
				_layout:[[1,1],[0.5,0.5],[0,0],true],
				_event:{
					AssetsManagerEvent:function(event) {
						Log("---AssetsManagerEvent begin");
						function updateFinish(upOK, code) {
							Log("AssetsManagerEvent() updateFinish upOK:" + upOK);
							Log("AssetsManagerEvent() updateFinish code:" + code);
							cc.eventManager.removeListener(listener);
							if (upOK == 1) {
								Log("-------- upOK==1");
								jsclient.resVersion = manager.getLocalManifest().getVersion();
								updateResFinish();
								manager.release();
							}
							else if (upOK == 2) {
								Log("-------- upOK==2");
								jsclient.restartGame();
								manager.release();
							}
							else {
								Log("-------- upOK==X");
								Log("-------- upOK  disconnect");

							}
							Log("-------- updateFinish release");
						}



						code = ["ERROR_NO_LOCAL_MANIFEST,", "ERROR_DOWNLOAD_MANIFEST", "ERROR_PARSE_MANIFEST", "NEW_VERSION_FOUND", "ALREADY_UP_TO_DATE",
								"UPDATE_PROGRESSION", "ASSET_UPDATED", "ERROR_UPDATING", "UPDATE_FINISHED", "UPDATE_FAILED", "ERROR_DECOMPRESS"];

						//var error=code[event.getEventCode()] + "|" + event.getMessage() + "|" + event.getAssetId() + "|" + event.getPercent();
						//cc.log(error);

						switch (event.getEventCode()) {

							case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
							case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
							case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
							case jsb.EventAssetsManager.ERROR_UPDATING:
							case jsb.EventAssetsManager.ERROR_DECOMPRESS:
							case jsb.EventAssetsManager.UPDATE_FAILED:

								updateFinish(0,event.getEventCode());

								break;

							case jsb.EventAssetsManager.NEW_VERSION_FOUND:
								break;
							case jsb.EventAssetsManager.UPDATE_PROGRESSION:
								updatePercent = event.getPercent();
								setProgressPercent(event.getPercent());
								break;
							case jsb.EventAssetsManager.ASSET_UPDATED:
								break;
							case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:

								updateFinish(1);


								break;
							case jsb.EventAssetsManager.UPDATE_FINISHED:
								updateFinish(2);
							   break;
							default:
								break;
						}
					}
				},
				load: {
					dian:
					{
						_run:function() {
							dotLoadAction(this);
						}
					}
				},
				barbk:{
					_run:function () {

					},
					bar:{
						_run:function () {
							bar = this;
						}
					}
				}
			}
		},
		ctor:function () {
			this._super();
			var updateui = ccs.load(res.Update_json);
			ConnectUI2Logic(updateui.node,this.jsBind);
			this.addChild(updateui.node);
			jsclient.updateui=this;
			return true;
		},
		onEnter:function () {
			this._super();
			jsclient.updateui.schedule(updateLoadingBar,0.01);
			jsclient.updateui.UpdateResource("sources14.happyplaygame.net");
		},
		UpdateResource:function(newUrl) {
			//init 提到外面, 下次修改
			Log("Update.js jsb.fileUtils.getWritablePath:" + jsb.fileUtils.getWritablePath());
			manager = new jsb.AssetsManager("res/project.manifest", jsb.fileUtils.getWritablePath()+"update");

			if("undefined" !=typeof (newUrl) && null != newUrl) {
				if("undefined" != typeof (manager.getLocalManifest().setReplaceUrl)) {
					manager.getLocalManifest().setReplaceUrl(newUrl);
					var url= manager.getLocalManifest().getPackageUrl();
					Log("--- updateResource url="+url);
				}
			}

			manager.update();
			Log("---updateResource 02");
			// As the process is asynchronised, you need to retain the assets manager to make sure it won't be released before the process is ended.
			manager.retain();

			if (!manager.getLocalManifest().isLoaded()) {
				Log("---updateResource 03");
				manager.release();
				Log("Fail to update assets, step skipped.");
			}
			else {
				Log("---updateResource 04");
				listener = new jsb.EventListenerAssetsManager(manager, function (event) {
					sendEvent("AssetsManagerEvent",event);
				});
				cc.eventManager.addListener(listener, 1);
			}
		}
	});
})();
