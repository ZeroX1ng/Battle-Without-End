package iPanel.iScene
{
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import tool.Effect;
   
   public class BeginScene extends Sprite
   {
      
      private var version:String = "1.4";
      
      public function BeginScene()
      {
         var bg:BasicCell;
         var cell:MovieClip;
         var begin:FlickerButton;
         var versionCell:StringCell;
         var facebook:SimpleButton;
         var _this:* = undefined;
         var down:Function = null;
         var onMouseDown:Function = null;
         super();
         down = function():*
         {
            var next:Function = null;
            next = function():*
            {
               var _loc1_:SaveScene = new SaveScene();
               Global.stage.addChild(_loc1_);
               Effect.fadeIn(_loc1_);
               _this.parent.removeChild(_this);
            };
            Effect.fadeOut(_this,10,next);
         };
         onMouseDown = function(param1:MouseEvent):*
         {
            navigateToURL(new URLRequest("https://www.facebook.com/pages/Crit-Game/492086344181628"),"_blank");
         };
         bg = new BasicCell(800,600);
         this.addChild(bg);
         cell = new caption_mc();
         this.addChild(cell);
         cell.x = -20;
         cell.y = 10;
         cell.scaleX = 1.8;
         cell.scaleY = 1.8;
         begin = new FlickerButton("开始游戏",200,80,40);
         this.addChild(begin);
         begin.x = 300;
         begin.y = 350;
         begin.downFunction = down;
         _this = this;
         versionCell = new StringCell("版本." + this.version,100,16);
         this.addChild(versionCell);
         versionCell.x = 730;
         versionCell.y = 570;
         facebook = new facebook_button();
         this.addChild(facebook);
         facebook.x = 650;
         facebook.y = 540;
         facebook.width = 50;
         facebook.height = 50;
         facebook.addEventListener(MouseEvent.MOUSE_DOWN,onMouseDown);
      }
   }
}

