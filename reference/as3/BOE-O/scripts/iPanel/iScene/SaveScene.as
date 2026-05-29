package iPanel.iScene
{
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.net.FileReference;
   import flash.net.SharedObject;
   import flash.text.TextField;
   import flash.text.TextFieldType;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.iPanel.ComfirmScene;
   import tool.Effect;
   
   public class SaveScene extends Sprite
   {
      
      public static var slot:String = "";
      
      private const Gap:int = 130;
      
      private const startX:int = 100;
      
      private const startY:int = 50;
      
      private var sharedObject:SharedObject;
      
      public function SaveScene()
      {
         super();
         this.drawSave(1);
         this.drawSave(2);
         this.drawSave(3);
         this.drawSave(4);
      }
      
      private function drawManualButton() : *
      {
         var _this:* = undefined;
         var manualDown:Function = null;
         manualDown = function():*
         {
            var file:FileReference = null;
            var selected:Function = null;
            var on_loaded:Function = null;
            selected = function(param1:Event):void
            {
               file.load();
               file.addEventListener(Event.COMPLETE,on_loaded);
            };
            on_loaded = function(param1:Event):void
            {
               var next:Function = null;
               var e:Event = param1;
               next = function():*
               {
                  var _loc1_:MainScene = new MainScene();
                  Global.mainScene = _loc1_;
                  Global.stage.addChild(_loc1_);
                  Effect.fadeIn(_loc1_);
               };
               Player.manualLoad(e.target.data);
               Effect.fadeOut(_this,10,next);
            };
            file = new FileReference();
            file.browse();
            file.addEventListener(Event.SELECT,selected);
            this.setBefore();
         };
         var manualLoad:FlickerButton = new FlickerButton("Manual Load",100,50,20);
         this.addChild(manualLoad);
         manualLoad.x = 680;
         manualLoad.y = -5;
         manualLoad.downFunction = manualDown;
         _this = this;
      }
      
      private function drawSave(param1:int) : *
      {
         this.sharedObject = SharedObject.getLocal("slot" + param1);
         if(this.sharedObject.data.userName)
         {
            this.drawOld(param1);
         }
         else
         {
            this.drawNew(param1);
            this.sharedObject.clear();
         }
      }
      
      private function drawNew(param1:int) : *
      {
         var name:StringCell;
         var text:TextField = null;
         var start:FlickerButton = null;
         var onIn:Function = null;
         var _this:* = undefined;
         var down:Function = null;
         var num:int = param1;
         onIn = function(param1:Event):*
         {
            var _loc2_:TextField = param1.target as TextField;
            if(_loc2_.text != "")
            {
               start.visible = true;
            }
            else
            {
               start.visible = false;
            }
         };
         down = function():*
         {
            var next:Function;
            if(slot == "")
            {
               next = function():*
               {
                  var _loc1_:RaceScene = new RaceScene();
                  Global.stage.addChild(_loc1_);
                  Effect.fadeIn(_loc1_);
               };
               slot = "slot" + num;
               Player.playerName = text.text;
               Effect.fadeOut(_this,10,next);
               _this.parent.removeChild(_this);
            }
         };
         var sp:MovieClip = new MovieClip();
         sp.graphics.lineStyle(2,7631988,1);
         sp.graphics.drawRect(0,0,600,100);
         this.addChild(sp);
         sp.x = this.startX;
         sp.y = this.startY + (num - 1) * this.Gap;
         sp.num = num;
         name = new StringCell("角色",150,32);
         sp.addChild(name);
         name.x = 20;
         name.y = 10;
         text = Global.getTextField();
         text.selectable = true;
         text.type = TextFieldType.INPUT;
         text.border = 2;
         text.borderColor = 7631988;
         sp.addChild(text);
         text.x = 100;
         text.y = 10;
         start = new FlickerButton("新建",100,50);
         sp.addChild(start);
         start.x = 480;
         start.y = 5;
         start.visible = false;
         text.addEventListener(Event.CHANGE,onIn);
         start.downFunction = down;
         _this = this;
      }
      
      private function drawOld(param1:int) : *
      {
         var name:StringCell;
         var text:StringCell;
         var time:StringCell;
         var load:FlickerButton;
         var dele:FlickerButton;
         var sp:MovieClip = null;
         var _this:* = undefined;
         var down:Function = null;
         var se:ComfirmScene = null;
         var deDown:Function = null;
         var deleDown:Function = null;
         var num:int = param1;
         down = function():*
         {
            var next:Function;
            if(slot == "")
            {
               next = function():*
               {
                  var _loc1_:MainScene = new MainScene();
                  Global.mainScene = _loc1_;
                  Global.stage.addChild(_loc1_);
                  Effect.fadeIn(_loc1_);
               };
               slot = "slot" + num;
               Player.load();
               Effect.fadeOut(_this,10,next);
            }
            this.setBefore();
         };
         deDown = function():*
         {
            _this.addChild(se);
            se.x = 250;
            se.y = 150;
            this.setBefore();
         };
         deleDown = function():*
         {
            sharedObject = SharedObject.getLocal("slot" + num);
            sharedObject.clear();
            _this.removeChild(sp);
            _this.drawSave(num);
            _this.removeChild(se);
         };
         sp = new MovieClip();
         sp.graphics.lineStyle(2,7631988,1);
         sp.graphics.drawRect(0,0,600,100);
         this.addChild(sp);
         sp.x = this.startX;
         sp.y = this.startY + (num - 1) * this.Gap;
         sp.num = num;
         name = new StringCell("角色",150,32);
         sp.addChild(name);
         name.x = 20;
         name.y = 10;
         text = new StringCell(this.sharedObject.data.userName,300,32);
         sp.addChild(text);
         text.x = 100;
         text.y = 10;
         time = new StringCell(this.sharedObject.data.time,200,32);
         sp.addChild(time);
         time.x = 200;
         time.y = 50;
         load = new FlickerButton("读取",100,40);
         sp.addChild(load);
         load.x = 480;
         load.y = 5;
         load.downFunction = down;
         _this = this;
         dele = new FlickerButton("删除",50,20,16);
         sp.addChild(dele);
         dele.x = 540;
         dele.y = 65;
         dele.downFunction = deDown;
         se = new ComfirmScene("确定删除?",deleDown);
         _this = this;
      }
   }
}

