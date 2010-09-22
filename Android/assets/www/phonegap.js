function dumpObj(obj,name,indent,depth){if(!indent){indent="  "}if(!depth){depth=1}if(!name){name="Obj"}if(depth>10){return indent+name+": <Maximum Depth Reached>\n"}if(typeof obj=="object"){var child=null;var output=indent+name+"\n";indent+="\t";var item;for(item in obj){var child="";try{child=obj[item]}catch(e){child="<Unable to Evaluate>"}if(typeof child=="object"){if(depth>1){output+=dumpObj(child,item,indent,depth-1)}}else{output+=indent+item+": "+child+"\n"}}return output}else{return obj}}if(typeof(DeviceInfo)!="object"){DeviceInfo={}}var PhoneGap={queue:{ready:true,commands:[],timer:null}};PhoneGap.Channel=function(type){this.type=type;this.handlers={};this.guid=0;this.fired=false;this.enabled=true};PhoneGap.Channel.prototype.subscribe=function(f,c,g){if(f==null){return}var func=f;if(typeof c=="object"&&f instanceof Function){func=PhoneGap.close(c,f)}g=g||func.observer_guid||f.observer_guid||this.guid++;func.observer_guid=g;f.observer_guid=g;this.handlers[g]=func;return g};PhoneGap.Channel.prototype.subscribeOnce=function(f,c){var g=null;var _this=this;var m=function(){f.apply(c||null,arguments);_this.unsubscribe(g)};if(this.fired){if(typeof c=="object"&&f instanceof Function){f=PhoneGap.close(c,f)}f.apply(this,this.fireArgs)}else{g=this.subscribe(m)}return g};PhoneGap.Channel.prototype.unsubscribe=function(g){if(g instanceof Function){g=g.observer_guid}this.handlers[g]=null;delete this.handlers[g]};PhoneGap.Channel.prototype.fire=function(e){console.log("fire("+this.type+")");var cnt=0;if(this.enabled){var fail=false;for(var item in this.handlers){cnt++;var handler=this.handlers[item];if(handler instanceof Function){var rv=(handler.apply(this,arguments)==false);fail=fail||rv}}this.fired=true;this.fireArgs=arguments;console.log(" -- sent "+cnt+" to "+this.type+" handlers");return !fail}return true};PhoneGap.Channel.join=function(h,c){var i=c.length;var f=function(){if(!(--i)){h()}};for(var j=0;j<i;j++){(!c[j].fired?c[j].subscribeOnce(f):i--)}if(!i){h()}};PhoneGap.available=DeviceInfo.uuid!=undefined;PhoneGap.addConstructor=function(func){PhoneGap.onPhoneGapInit.subscribeOnce(function(){try{func()}catch(e){if(typeof(debug.log)=="function"){debug.log("Failed to run constructor: "+debug.processMessage(e))}else{alert("Failed to run constructor: "+e.message)}}})};PhoneGap.addPlugin=function(name,obj){if(!window.plugins){window.plugins={}}if(!window.plugins[name]){window.plugins[name]=obj}};PhoneGap.onDOMContentLoaded=new PhoneGap.Channel("onDOMContentLoaded");PhoneGap.onNativeReady=new PhoneGap.Channel("onNativeReady");PhoneGap.onPhoneGapInit=new PhoneGap.Channel("onPhoneGapInit");PhoneGap.onPhoneGapReady=new PhoneGap.Channel("onPhoneGapReady");PhoneGap.onPhoneGapInfoReady=new PhoneGap.Channel("onPhoneGapInfoReady");PhoneGap.onResume=new PhoneGap.Channel("onResume");PhoneGap.onPause=new PhoneGap.Channel("onPause");if(typeof _nativeReady!=="undefined"){PhoneGap.onNativeReady.fire()}PhoneGap.onDeviceReady=new PhoneGap.Channel("onDeviceReady");PhoneGap.Channel.join(function(){console.log("JOIN - onDOMContentLoaded + onNativeReady");PhoneGap.JSCallback();PhoneGap.onPhoneGapInit.fire();PhoneGap.onPhoneGapReady.fire()},[PhoneGap.onDOMContentLoaded,PhoneGap.onNativeReady]);PhoneGap.Channel.join(function(){console.log("JOIN - onPhoneGapReady + onPhoneGapInfoReady");PhoneGap.onDeviceReady.fire();PhoneGap.onResume.fire()},[PhoneGap.onPhoneGapReady,PhoneGap.onPhoneGapInfoReady]);document.addEventListener("DOMContentLoaded",function(){PhoneGap.onDOMContentLoaded.fire()},false);PhoneGap.m_document_addEventListener=document.addEventListener;document.addEventListener=function(evt,handler,capture){var e=evt.toLowerCase();if(e=="deviceready"){PhoneGap.onDeviceReady.subscribeOnce(handler)}else{if(e=="resume"){PhoneGap.onResume.subscribe(handler)}else{if(e=="pause"){PhoneGap.onPause.subscribe(handler)}else{PhoneGap.m_document_addEventListener.call(document,evt,handler)}}}};PhoneGap.stringify=function(args){if(typeof JSON=="undefined"){var s="[";for(var i=0;i<args.length;i++){if(i>0){s=s+","}var type=typeof args[i];if((type=="number")||(type=="boolean")){s=s+args[i]}else{s=s+'"'+args[i]+'"'}}s=s+"]";return s}else{return JSON.stringify(args)}};PhoneGap.callbackId=0;PhoneGap.callbacks={};PhoneGap.exec=function(clazz,action,args){try{var callbackId=0;var r=PluginManager.exec(clazz,action,callbackId,this.stringify(args),false);eval("var v="+r+";");if(v.status==0){return v.message}else{console.log("Error: Status="+r.status+" Message="+v.message);return null}}catch(e){console.log("Error: "+e)}};PhoneGap.execAsync=function(success,fail,service,action,args){try{var callbackId=service+PhoneGap.callbackId++;if(success||fail){PhoneGap.callbacks[callbackId]={success:success,fail:fail}}var r=""+PluginManager.exec(service,action,callbackId,this.stringify(args),true);if(r.length>0){console.log("Result from exec=<"+dumpObj(r,""," ",2)+">");eval("var v="+r+";");if(v.status==0){if(success){success(v.message);delete PhoneGap.callbacks[callbackId]}return v.message}else{console.log("Error: Status="+r.status+" Message="+v.message);if(fail){fail(v.message);delete PhoneGap.callbacks[callbackId]}return null}}}catch(e){console.log("Error: "+e)}};PhoneGap.callbackSuccess=function(callbackId,args){console.log("callbackSuccess("+dumpObj(args,""," ",2)+")");if(PhoneGap.callbacks[callbackId]){try{if(PhoneGap.callbacks[callbackId].success){PhoneGap.callbacks[callbackId].success(args.message)}}catch(e){console.log("Error in success callback: "+callbackId+" = "+e)}delete PhoneGap.callbacks[callbackId]}};PhoneGap.callbackError=function(callbackId,args){console.log("callbackError("+args+")");if(PhoneGap.callbacks[callbackId]){try{if(PhoneGap.callbacks[callbackId].fail){PhoneGap.callbacks[callbackId].fail(args.message)}}catch(e){console.log("Error in error callback: "+callbackId+" = "+e)}delete PhoneGap.callbacks[callbackId]}};PhoneGap.run_command=function(){if(!PhoneGap.available||!PhoneGap.queue.ready){return}PhoneGap.queue.ready=false;var args=PhoneGap.queue.commands.shift();if(PhoneGap.queue.commands.length==0){clearInterval(PhoneGap.queue.timer);PhoneGap.queue.timer=null}var uri=[];var dict=null;for(var i=1;i<args.length;i++){var arg=args[i];if(arg==undefined||arg==null){arg=""}if(typeof(arg)=="object"){dict=arg}else{uri.push(encodeURIComponent(arg))}}var url="gap://"+args[0]+"/"+uri.join("/");if(dict!=null){var query_args=[];for(var name in dict){if(typeof(name)!="string"){continue}query_args.push(encodeURIComponent(name)+"="+encodeURIComponent(dict[name]))}if(query_args.length>0){url+="?"+query_args.join("&")}}document.location=url};PhoneGap.JSCallback=function(){var xmlhttp=new XMLHttpRequest();xmlhttp.onreadystatechange=function(){if(xmlhttp.readyState==4){if(xmlhttp.status==200){var msg=xmlhttp.responseText;console.log(">>>>>>>> XHR response="+msg);setTimeout(function(){try{var t=eval(msg)}catch(e){console.log("JSCallback Error: "+e+"\nMsg="+msg)}},1);setTimeout(PhoneGap.JSCallback,1)}else{if(xmlhttp.status==404){setTimeout(PhoneGap.JSCallback,10)}else{console.log("JSCallback Error: Request failed.");CallbackServer.restartServer();setTimeout(PhoneGap.JSCallback,100)}}}};xmlhttp.open("GET","http://127.0.0.1:"+CallbackServer.getPort()+"/",true);xmlhttp.send()};PhoneGap.createUUID=function(){return PhoneGap.UUIDcreatePart(4)+"-"+PhoneGap.UUIDcreatePart(2)+"-"+PhoneGap.UUIDcreatePart(2)+"-"+PhoneGap.UUIDcreatePart(2)+"-"+PhoneGap.UUIDcreatePart(6)};PhoneGap.UUIDcreatePart=function(length){var uuidpart="";for(var i=0;i<length;i++){var uuidchar=parseInt((Math.random()*256)).toString(16);if(uuidchar.length==1){uuidchar="0"+uuidchar}uuidpart+=uuidchar}return uuidpart};PhoneGap.close=function(context,func,params){if(typeof params==="undefined"){return function(){return func.apply(context,arguments)}}else{return function(){return func.apply(context,params)}}};function Acceleration(x,y,z){this.x=x;this.y=y;this.z=z;this.timestamp=new Date().getTime()}function Accelerometer(){this.lastAcceleration=null;this.timers={}}Accelerometer.ERROR_MSG=["Not running","Starting","","Failed to start"];Accelerometer.prototype.getCurrentAcceleration=function(successCallback,errorCallback,options){console.log("Accelerometer.getCurrentAcceleration()");if(typeof successCallback!="function"){console.log("Accelerometer Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Accelerometer Error: errorCallback is not a function");return}PhoneGap.execAsync(successCallback,errorCallback,"Accelerometer","getAcceleration",[])};Accelerometer.prototype.watchAcceleration=function(successCallback,errorCallback,options){var frequency=(options!=undefined)?options.frequency:10000;if(typeof successCallback!="function"){console.log("Accelerometer Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Accelerometer Error: errorCallback is not a function");return}PhoneGap.execAsync(function(timeout){if(timeout<(frequency+10000)){PhoneGap.execAsync(null,null,"Accelerometer","setTimeout",[frequency+10000])}},function(e){},"Accelerometer","getTimeout",[]);var id=PhoneGap.createUUID();navigator.accelerometer.timers[id]=setInterval(function(){PhoneGap.execAsync(successCallback,errorCallback,"Accelerometer","getAcceleration",[])},(frequency?frequency:1));return id};Accelerometer.prototype.clearWatch=function(id){if(id&&navigator.accelerometer.timers[id]){clearInterval(navigator.accelerometer.timers[id]);delete navigator.accelerometer.timers[id]}};PhoneGap.addConstructor(function(){if(typeof navigator.accelerometer=="undefined"){navigator.accelerometer=new Accelerometer()}});Camera=function(){this.successCallback=null;this.errorCallback=null;this.options=null};Camera.DestinationType={DATA_URL:0,FILE_URI:1};Camera.prototype.DestinationType=Camera.DestinationType;Camera.PictureSourceType={PHOTOLIBRARY:0,CAMERA:1,SAVEDPHOTOALBUM:2};Camera.prototype.PictureSourceType=Camera.PictureSourceType;Camera.prototype.getPicture=function(successCallback,errorCallback,options){if(typeof successCallback!="function"){console.log("Camera Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Camera Error: errorCallback is not a function");return}this.successCallback=successCallback;this.errorCallback=errorCallback;this.options=options;var quality=80;if(options.quality){quality=this.options.quality}var destinationType=Camera.DestinationType.DATA_URL;if(this.options.destinationType){destinationType=this.options.destinationType}var sourceType=Camera.PictureSourceType.CAMERA;if(typeof this.options.sourceType=="number"){sourceType=this.options.sourceType}PhoneGap.execAsync(null,null,"Camera","takePicture",[quality,destinationType,sourceType])};Camera.prototype.success=function(picture){if(this.successCallback){this.successCallback(picture)}};Camera.prototype.error=function(err){if(this.errorCallback){this.errorCallback(err)}};PhoneGap.addConstructor(function(){if(typeof navigator.camera=="undefined"){navigator.camera=new Camera()}});function Compass(){this.lastHeading=null;this.timers={}}Compass.ERROR_MSG=["Not running","Starting","","Failed to start"];Compass.prototype.getCurrentHeading=function(successCallback,errorCallback,options){if(typeof successCallback!="function"){console.log("Compass Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Compass Error: errorCallback is not a function");return}PhoneGap.execAsync(successCallback,errorCallback,"Compass","getHeading",[])};Compass.prototype.watchHeading=function(successCallback,errorCallback,options){var frequency=(options!=undefined)?options.frequency:100;if(typeof successCallback!="function"){console.log("Compass Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Compass Error: errorCallback is not a function");return}PhoneGap.execAsync(function(timeout){if(timeout<(frequency+10000)){PhoneGap.execAsync(null,null,"Compass","setTimeout",[frequency+10000])}},function(e){},"Compass","getTimeout",[]);var id=PhoneGap.createUUID();navigator.compass.timers[id]=setInterval(function(){PhoneGap.execAsync(successCallback,errorCallback,"Compass","getHeading",[])},(frequency?frequency:1));return id};Compass.prototype.clearWatch=function(id){if(id&&navigator.compass.timers[id]){clearInterval(navigator.compass.timers[id]);delete navigator.compass.timers[id]}};PhoneGap.addConstructor(function(){if(typeof navigator.compass=="undefined"){navigator.compass=new Compass()}});var Contact=function(){this.name=new ContactName();this.emails=[];this.phones=[]};var ContactName=function(){this.formatted="";this.familyName="";this.givenName="";this.additionalNames=[];this.prefixes=[];this.suffixes=[]};var ContactEmail=function(){this.types=[];this.address=""};var ContactPhoneNumber=function(){this.types=[];this.number=""};var Contacts=function(){this.records=[]};Contacts.prototype.find=function(obj,win,fail){console.log("Contacts.find()");this.win=win;this.fail=fail;if(obj.name!=null){var searchTerm="";if(obj.name.givenName&&obj.name.givenName.length>0){searchTerm=obj.name.givenName.split(" ").join("%")}if(obj.name.familyName&&obj.name.familyName.length>0){searchTerm+=obj.name.familyName.split(" ").join("%")}if(!obj.name.familyName&&!obj.name.givenName&&obj.name.formatted){searchTerm=obj.name.formatted}PhoneGap.execAsync(null,null,"Contacts","search",[searchTerm,"",""])}};Contacts.prototype.droidFoundContact=function(name,npa,email){var contact=new Contact();contact.name=new ContactName();contact.name.formatted=name;contact.name.givenName=name;var mail=new ContactEmail();mail.types.push("home");mail.address=email;contact.emails.push(mail);phone=new ContactPhoneNumber();phone.types.push("home");phone.number=npa;contact.phones.push(phone);this.records.push(contact)};Contacts.prototype.droidDone=function(){this.win(this.records)};PhoneGap.addConstructor(function(){if(typeof navigator.contacts=="undefined"){navigator.contacts=new Contacts()}});var Crypto=function(){};Crypto.prototype.encrypt=function(seed,string,callback){this.encryptWin=callback;PhoneGap.execAsync(null,null,"Crypto","encrypt",[seed,string])};Crypto.prototype.decrypt=function(seed,string,callback){this.decryptWin=callback;PhoneGap.execAsync(null,null,"Crypto","decrypt",[seed,string])};Crypto.prototype.gotCryptedString=function(string){this.encryptWin(string)};Crypto.prototype.getPlainString=function(string){this.decryptWin(string)};PhoneGap.addConstructor(function(){if(typeof navigator.Crypto=="undefined"){navigator.Crypto=new Crypto()}});function Device(){console.log(">>>>>>>>>>>> Device()");this.available=PhoneGap.available;this.platform=null;this.version=null;this.name=null;this.uuid=null;this.phonegap=null;var me=this;this.getInfo(function(info){console.log("--- Got INFO");me.available=true;me.platform=info.platform;me.version=info.version;me.uuid=info.uuid;me.phonegap=info.phonegap;PhoneGap.onPhoneGapInfoReady.fire()},function(e){me.available=false;console.log("Error initializing PhoneGap: "+e);alert("Error initializing PhoneGap: "+e)})}Device.prototype.getInfo=function(successCallback,errorCallback){if(typeof successCallback!="function"){console.log("Device Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Device Error: errorCallback is not a function");return}PhoneGap.execAsync(successCallback,errorCallback,"Device","getDeviceInfo",[])};Device.prototype.overrideBackButton=function(){BackButton.override()};Device.prototype.resetBackButton=function(){BackButton.reset()};Device.prototype.exitApp=function(){BackButton.exitApp()};PhoneGap.addConstructor(function(){navigator.device=window.device=new Device()});function FileList(){this.files={}}function File(){this.name=null;this.type=null;this.urn=null}File._createEvent=function(type,target){var evt={type:type};evt.target=target;return evt};function FileError(){this.NOT_FOUND_ERR=8;this.SECURITY_ERR=18;this.ABORT_ERR=20;this.NOT_READABLE_ERR=24;this.ENCODING_ERR=26;this.code=null}function FileMgr(){}FileMgr.prototype.getFileBasePaths=function(){};FileMgr.prototype.testSaveLocationExists=function(successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","testSaveLocationExists",[])};FileMgr.prototype.testFileExists=function(fileName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","testFileExists",[fileName])};FileMgr.prototype.testDirectoryExists=function(dirName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","testDirectoryExists",[dirName])};FileMgr.prototype.createDirectory=function(dirName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","createDirectory",[dirName])};FileMgr.prototype.deleteDirectory=function(dirName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","deleteDirectory",[dirName])};FileMgr.prototype.deleteFile=function(fileName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","deleteFile",[fileName])};FileMgr.prototype.getFreeDiskSpace=function(successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","getFreeDiskSpace",[])};FileMgr.prototype.writeAsText=function(fileName,data,append,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","writeAsText",[fileName,data,append])};FileMgr.prototype.readAsText=function(fileName,encoding,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","readAsText",[fileName,encoding])};FileMgr.prototype.readAsDataURL=function(fileName,successCallback,errorCallback){PhoneGap.execAsync(successCallback,errorCallback,"File","readAsDataURL",[fileName])};PhoneGap.addConstructor(function(){if(typeof navigator.fileMgr=="undefined"){navigator.fileMgr=new FileMgr()}});function FileReader(){this.fileName="";this.readyState=0;this.result=null;this.error=null;this.onloadstart=null;this.onprogress=null;this.onload=null;this.onerror=null;this.onloadend=null;this.onabort=null}FileReader.EMPTY=0;FileReader.LOADING=1;FileReader.DONE=2;FileReader.prototype.abort=function(){this.readyState=FileReader.DONE;if(typeof this.onabort=="function"){var evt=File._createEvent("abort",this);this.onabort(evt)}};FileReader.prototype.readAsText=function(file,encoding){this.fileName=file;this.readyState=FileReader.LOADING;if(typeof this.onloadstart=="function"){var evt=File._createEvent("loadstart",this);this.onloadstart(evt)}var enc=encoding?encoding:"UTF-8";var me=this;navigator.fileMgr.readAsText(file,enc,function(r){if(me.readyState==FileReader.DONE){return}me.result=r;me.readyState=FileReader.DONE;if(typeof me.onload=="function"){var evt=File._createEvent("load",me);me.onload(evt)}if(typeof me.onloadend=="function"){var evt=File._createEvent("loadend",me);me.onloadend(evt)}},function(e){if(me.readyState==FileReader.DONE){return}me.error=e;me.readyState=FileReader.DONE;if(typeof me.onerror=="function"){var evt=File._createEvent("error",me);me.onerror(evt)}if(typeof me.onloadend=="function"){var evt=File._createEvent("loadend",me);me.onloadend(evt)}})};FileReader.prototype.readAsDataURL=function(file){this.fileName=file;this.readyState=FileReader.LOADING;if(typeof this.onloadstart=="function"){var evt=File._createEvent("loadstart",this);this.onloadstart(evt)}var me=this;navigator.fileMgr.readAsDataURL(file,function(r){if(me.readyState==FileReader.DONE){return}me.result=r;me.readyState=FileReader.DONE;if(typeof me.onload=="function"){var evt=File._createEvent("load",me);me.onload(evt)}if(typeof me.onloadend=="function"){var evt=File._createEvent("loadend",me);me.onloadend(evt)}},function(e){if(me.readyState==FileReader.DONE){return}me.error=e;me.readyState=FileReader.DONE;if(typeof me.onerror=="function"){var evt=File._createEvent("error",me);me.onerror(evt)}if(typeof me.onloadend=="function"){var evt=File._createEvent("loadend",me);me.onloadend(evt)}})};FileReader.prototype.readAsBinaryString=function(file){this.fileName=file};function FileWriter(){this.fileName="";this.result=null;this.readyState=0;this.result=null;this.onerror=null;this.oncomplete=null}FileWriter.EMPTY=0;FileWriter.LOADING=1;FileWriter.DONE=2;FileWriter.prototype.writeAsText=function(file,text,bAppend){if(bAppend!=true){bAppend=false}this.fileName=file;this.readyState=FileWriter.LOADING;var me=this;navigator.fileMgr.writeAsText(file,text,bAppend,function(r){if(me.readyState==FileWriter.DONE){return}me.result=r;me.readyState=FileWriter.DONE;if(typeof me.oncomplete=="function"){var evt=File._createEvent("complete",me);me.oncomplete(evt)}},function(e){if(me.readyState==FileWriter.DONE){return}me.error=e;me.readyState=FileWriter.DONE;if(typeof me.onerror=="function"){var evt=File._createEvent("error",me);me.onerror(evt)}})};function Geolocation(){this.lastPosition=null;this.listeners={}}function PositionError(code,message){this.code=code;this.message=message}PositionError.PERMISSION_DENIED=1;PositionError.POSITION_UNAVAILABLE=2;PositionError.TIMEOUT=3;Geolocation.prototype.getCurrentPosition=function(successCallback,errorCallback,options){console.log("Geolocation.getCurrentPosition()");if(navigator._geo.listeners.global){console.log("Geolocation Error: Still waiting for previous getCurrentPosition() request.");try{errorCallback(new PositionError(PositionError.TIMEOUT,"Geolocation Error: Still waiting for previous getCurrentPosition() request."))}catch(e){}return}navigator._geo.listeners.global={success:successCallback,fail:errorCallback};PhoneGap.execAsync(null,null,"Geolocation","getCurrentLocation",[])};Geolocation.prototype.watchPosition=function(successCallback,errorCallback,options){var frequency=(options!=undefined)?options.frequency:10000;var id=PhoneGap.createUUID();navigator._geo.listeners[id]={success:successCallback,fail:errorCallback};PhoneGap.execAsync(null,null,"Geolocation","start",[frequency,id]);return id};Geolocation.prototype.success=function(id,lat,lng,alt,altacc,head,vel,stamp){var coords=new Coordinates(lat,lng,alt,altacc,head,vel);var loc=new Position(coords,stamp);try{if(lat=="undefined"||lng=="undefined"){navigator._geo.listeners[id].fail(new PositionError(PositionError.POSITION_UNAVAILABLE,"Lat/Lng are undefined."))}else{navigator._geo.lastPosition=loc;navigator._geo.listeners[id].success(loc)}}catch(e){console.log("Geolocation Error: Error calling success callback function.")}if(id=="global"){delete navigator._geo.listeners.global}};Geolocation.prototype.fail=function(id,code,msg){try{navigator._geo.listeners[id].fail(new PositionError(code,msg))}catch(e){console.log("Geolocation Error: Error calling error callback function.")}};Geolocation.prototype.clearWatch=function(id){PhoneGap.execAsync(null,null,"Geolocation","stop",[id]);delete navigator._geo.listeners[id]};Geolocation.usingPhoneGap=false;Geolocation.usePhoneGap=function(){if(Geolocation.usingPhoneGap){return}Geolocation.usingPhoneGap=true;console.log("#################### Using PhoneGap geolocation.");navigator.geolocation.setLocation=navigator._geo.setLocation;navigator.geolocation.getCurrentPosition=navigator._geo.getCurrentPosition;navigator.geolocation.watchPosition=navigator._geo.watchPosition;navigator.geolocation.clearWatch=navigator._geo.clearWatch;navigator.geolocation.start=navigator._geo.start;navigator.geolocation.stop=navigator._geo.stop};PhoneGap.addConstructor(function(){navigator._geo=new Geolocation();if(typeof navigator.geolocation=="undefined"){navigator.geolocation=navigator._geo;Geolocation.usingPhoneGap=true}else{console.log("################## GEOLOCATION BUILT-IN")}});function KeyEvent(){}KeyEvent.prototype.menuTrigger=function(){var e=document.createEvent("Events");e.initEvent("menuKeyDown");document.dispatchEvent(e)};KeyEvent.prototype.backTrigger=function(){var e=document.createEvent("Events");e.initEvent("backKeyDown");document.dispatchEvent(e)};KeyEvent.prototype.searchTrigger=function(){var e=document.createEvent("Events");e.initEvent("searchKeyDown");document.dispatchEvent(e)};if(document.keyEvent==null||typeof document.keyEvent=="undefined"){window.keyEvent=document.keyEvent=new KeyEvent()}PhoneGap.mediaObjects={};PhoneGap.Media=function(){};PhoneGap.Media.getMediaObject=function(id){return PhoneGap.mediaObjects[id]};PhoneGap.Media.onStatus=function(id,msg,value){var media=PhoneGap.mediaObjects[id];console.log("Media.onStatus("+msg+", "+value+")");if(msg==Media.MEDIA_STATE){if(value==Media.MEDIA_STOPPED){if(media.successCallback){media.successCallback()}}if(media.statusCallback){media.statusCallback(value)}}else{if(msg==Media.MEDIA_DURATION){media._duration=value}else{if(msg==Media.MEDIA_ERROR){if(media.errorCallback){media.errorCallback(value)}}}}};Media=function(src,successCallback,errorCallback,statusCallback,positionCallback){if(successCallback&&(typeof successCallback!="function")){console.log("Media Error: successCallback is not a function");return}if(errorCallback&&(typeof errorCallback!="function")){console.log("Media Error: errorCallback is not a function");return}if(statusCallback&&(typeof statusCallback!="function")){console.log("Media Error: statusCallback is not a function");return}if(positionCallback&&(typeof positionCallback!="function")){console.log("Media Error: positionCallback is not a function");return}this.id=PhoneGap.createUUID();console.log("Media("+src+") id="+this.id);PhoneGap.mediaObjects[this.id]=this;this.src=src;this.successCallback=successCallback;this.errorCallback=errorCallback;this.statusCallback=statusCallback;this.positionCallback=positionCallback;this._duration=-1;this._position=-1};Media.MEDIA_STATE=1;Media.MEDIA_DURATION=2;Media.MEDIA_ERROR=9;Media.MEDIA_NONE=0;Media.MEDIA_STARTING=1;Media.MEDIA_RUNNING=2;Media.MEDIA_PAUSED=3;Media.MEDIA_STOPPED=4;Media.MEDIA_MSG=["None","Starting","Running","Paused","Stopped"];function MediaError(){this.code=null,this.message=""}MediaError.MEDIA_ERR_ABORTED=1;MediaError.MEDIA_ERR_NETWORK=2;MediaError.MEDIA_ERR_DECODE=3;MediaError.MEDIA_ERR_NONE_SUPPORTED=4;Media.prototype.play=function(){console.log("Media.play() - src="+this.src+" id="+this.id);PhoneGap.execAsync(null,null,"Media","startPlayingAudio",[this.id,this.src])};Media.prototype.stop=function(){console.log("Media.stop() - src="+this.src+" id="+this.id);return PhoneGap.execAsync(null,null,"Media","stopPlayingAudio",[this.id])};Media.prototype.pause=function(){console.log("Media.pause() - src="+this.src+" id="+this.id);PhoneGap.execAsync(null,null,"Media","pausePlayingAudio",[this.id])};Media.prototype.getDuration=function(){console.log("Media.getDuration() - src="+this.src+" id="+this.id);return this._duration};Media.prototype.getCurrentPosition=function(success,fail){console.log("Media.getCurrentPosition()");PhoneGap.execAsync(success,fail,"Media","getCurrentPositionAudio",[this.id])};Media.prototype.startRecord=function(){console.log("Media.startRecord() - src="+this.src+" id="+this.id);PhoneGap.execAsync(null,null,"Media","startRecordingAudio",[this.id,this.src])};Media.prototype.stopRecord=function(){console.log("Media.stopRecord() - src="+this.src+" id="+this.id);PhoneGap.execAsync(null,null,"Media","stopRecordingAudio",[this.id])};function NetworkStatus(){}NetworkStatus.NOT_REACHABLE=0;NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK=1;NetworkStatus.REACHABLE_VIA_WIFI_NETWORK=2;function Network(){console.log("Network()");this.lastReachability=null}Network.prototype.updateReachability=function(reachability){console.log("Network.updateReachability("+reachability+")");this.lastReachability=reachability};Network.prototype.isReachable=function(uri,callback,options){var isIpAddress=false;if(options&&options.isIpAddress){isIpAddress=options.isIpAddress}PhoneGap.execAsync(callback,null,"Network Status","isReachable",[uri,isIpAddress])};PhoneGap.addConstructor(function(){if(typeof navigator.network=="undefined"){navigator.network=new Network()}});function Notification(){}Notification.prototype.alert=function(message,title,buttonLabel){alert(message)};Notification.prototype.activityStart=function(){};Notification.prototype.activityStop=function(){};Notification.prototype.blink=function(count,colour){};Notification.prototype.vibrate=function(mills){PhoneGap.execAsync(null,null,"Device","vibrate",[mills])};Notification.prototype.beep=function(count){PhoneGap.execAsync(null,null,"Device","beep",[count])};PhoneGap.addConstructor(function(){if(typeof navigator.notification=="undefined"){navigator.notification=new Notification()}});function Position(coords,timestamp){this.coords=coords;this.timestamp=new Date().getTime()}function Coordinates(lat,lng,alt,acc,head,vel,altacc){this.latitude=lat;this.longitude=lng;this.accuracy=acc;this.altitude=alt;this.heading=head;this.speed=vel;this.altitudeAccuracy=(altacc!="undefined")?altacc:null}function PositionOptions(){this.enableHighAccuracy=true;this.timeout=10000}function PositionError(){this.code=null;this.message=""}PositionError.UNKNOWN_ERROR=0;PositionError.PERMISSION_DENIED=1;PositionError.POSITION_UNAVAILABLE=2;PositionError.TIMEOUT=3;PhoneGap.addConstructor(function(){if(typeof navigator.splashScreen=="undefined"){navigator.splashScreen=SplashScreen}});var DroidDB=function(){this.txQueue=[]};DroidDB.prototype.addResult=function(rawdata,tx_id){eval("var data = "+rawdata);var tx=this.txQueue[tx_id];tx.resultSet.push(data)};DroidDB.prototype.completeQuery=function(tx_id){var tx=this.txQueue[tx_id];var r=new result();r.rows.resultSet=tx.resultSet;r.rows.length=tx.resultSet.length;tx.win(r)};DroidDB.prototype.fail=function(reason,tx_id){var tx=this.txQueue[tx_id];tx.fail(reason)};var DatabaseShell=function(){};DatabaseShell.prototype.transaction=function(process){tx=new Tx();process(tx)};var Tx=function(){droiddb.txQueue.push(this);this.id=droiddb.txQueue.length-1;this.resultSet=[]};Tx.prototype.executeSql=function(query,params,win,fail){PhoneGap.execAsync(null,null,"Storage","executeSql",[query,params,this.id]);tx.win=win;tx.fail=fail};var result=function(){this.rows=new Rows()};var Rows=function(){this.resultSet=[];this.length=0};Rows.prototype.item=function(row_id){return this.resultSet[id]};var dbSetup=function(name,version,display_name,size){PhoneGap.execAsync(null,null,"Storage","openDatabase",[name,version,display_name,size]);db_object=new DatabaseShell();return db_object};PhoneGap.addConstructor(function(){if(typeof window.openDatabase=="undefined"){navigator.openDatabase=window.openDatabase=dbSetup;window.droiddb=new DroidDB()}});