package Main_fla
{
   import adobe.utils.*;
   import com.spikything.utils.MouseWheelTrap;
   import flash.accessibility.*;
   import flash.desktop.*;
   import flash.display.*;
   import flash.errors.*;
   import flash.events.*;
   import flash.external.*;
   import flash.filters.*;
   import flash.geom.*;
   import flash.globalization.*;
   import flash.media.*;
   import flash.net.*;
   import flash.net.drm.*;
   import flash.printing.*;
   import flash.profiler.*;
   import flash.sampler.*;
   import flash.sensors.*;
   import flash.system.*;
   import flash.text.*;
   import flash.text.engine.*;
   import flash.text.ime.*;
   import flash.ui.*;
   import flash.utils.*;
   import flash.xml.*;
   
   public dynamic class MainTimeline extends MovieClip
   {
      
      public var lotxt:TextField;
      
      public var _this:*;
      
      public var line:Sprite;
      
      public var myContextMenu:ContextMenu;
      
      public function MainTimeline()
      {
         super();
         addFrameScript(0,this.frame1,1,this.frame2);
      }
      
      public function loadProgress(param1:ProgressEvent) : void
      {
         this.lotxt.text = String(int(param1.bytesLoaded / param1.bytesTotal * 100)) + "%";
         this.drawLine(param1.bytesLoaded / param1.bytesTotal);
      }
      
      public function init(param1:Event) : void
      {
         this._this.removeChild(this.lotxt);
         this.line.graphics.clear();
         this._this.removeChild(this.line);
         gotoAndStop(2);
      }
      
      public function drawLine(param1:Number) : *
      {
         this.line.graphics.lineStyle(2,0);
         this.line.graphics.moveTo(0,0);
         this.line.graphics.lineTo(param1 * 100,0);
      }
      
      internal function frame1() : *
      {
         stop();
         root.loaderInfo.addEventListener(ProgressEvent.PROGRESS,this.loadProgress,false,0,true);
         root.loaderInfo.addEventListener(Event.COMPLETE,this.init,false,0,true);
         this.lotxt = new TextField();
         this.addChild(this.lotxt);
         this.lotxt.x = 390;
         this.lotxt.y = 280;
         this.lotxt.defaultTextFormat = new TextFormat("Nesobrite Cd","32");
         this._this = this;
         this.line = new Sprite();
         this.line.graphics.lineStyle(2,15066597);
         this.line.graphics.moveTo(0,0);
         this.line.graphics.lineTo(100,0);
         this.addChild(this.line);
         this.line.x = 350;
         this.line.y = 330;
      }
      
      internal function frame2() : *
      {
         MouseWheelTrap.setup(stage);
         this.myContextMenu = new ContextMenu();
         this.myContextMenu.hideBuiltInItems();
         this.contextMenu = this.myContextMenu;
         this.addChild(new Main());
      }
   }
}

