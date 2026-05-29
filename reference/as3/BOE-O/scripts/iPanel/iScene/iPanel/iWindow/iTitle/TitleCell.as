package iPanel.iScene.iPanel.iWindow.iTitle
{
   import flash.display.Sprite;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import iData.iPlayer.Title;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.ItemInfoWindow;
   import iPanel.iCell.StringCell;
   import tool.MyEvent;
   
   public class TitleCell extends BasicCell
   {
      
      public var infoWindow:ItemInfoWindow;
      
      public var text:StringCell;
      
      public var title:Title;
      
      protected var bg:Sprite;
      
      protected const yellow:uint = 14922250;
      
      public function TitleCell(param1:Title)
      {
         this.title = param1;
         super(200,50);
         this.bg = new Sprite();
         this.bg.graphics.lineStyle(1,13487565,0.8);
         this.bg.graphics.beginFill(16777215,0.95);
         this.bg.graphics.drawRect(0,0,200,50);
         this.bg.graphics.endFill();
         this.addChild(this.bg);
         this.setInfo();
         this.setBg();
         this.addEventListener(MouseEvent.MOUSE_OVER,this.onMouseOver);
         this.addEventListener(MouseEvent.MOUSE_OUT,this.onMouseOut);
         this.setListener();
      }
      
      private function onMouseDown(param1:MouseEvent) : void
      {
         Player.setTitle(this.title);
         dispatchEvent(new MyEvent(MyEvent.Update));
      }
      
      private function setListener() : void
      {
         if(this.title.isGot)
         {
            this.addEventListener(MouseEvent.MOUSE_DOWN,this.onMouseDown);
         }
      }
      
      private function setBg() : void
      {
         if(this.title.isGot)
         {
            this.bg.transform.colorTransform = new ColorTransform();
         }
         else
         {
            this.bg.transform.colorTransform = new ColorTransform(0,0,0,0.8,200,200,200);
         }
      }
      
      public function update() : *
      {
         if(Player.title == this.title)
         {
            this.bg.transform.colorTransform = new ColorTransform(0.9,0.7,0,1,0,0,0,0);
            this.text.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         }
         else
         {
            this.setBg();
            this.text.transform.colorTransform = new ColorTransform();
         }
         this.setListener();
      }
      
      private function setInfo() : *
      {
         this.text = new StringCell(this.title.realName.toUpperCase(),180,24);
         this.addChild(this.text);
         this.text.x = 10;
         this.text.y = 10;
         this.infoWindow = new ItemInfoWindow(this.title.getDescription());
      }
      
      public function onMouseOver(param1:MouseEvent) : void
      {
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
         this.addInfoWindow();
      }
      
      public function onMouseOut(param1:MouseEvent) : void
      {
         this.filters = [];
         this.removeInfoWindow();
      }
      
      protected function addInfoWindow() : *
      {
         this.infoWindow = new ItemInfoWindow(this.title.getDescription());
         this.addChild(this.infoWindow);
         this.infoWindow.x = -135;
         this.infoWindow.y = 0;
         var _loc1_:Point = this.localToGlobal(new Point(0,0));
         if(_loc1_.y + this.infoWindow.height > Global.stage.stageHeight)
         {
            _loc1_ = this.globalToLocal(new Point(0,Global.stage.stageHeight - this.infoWindow.height));
            this.infoWindow.y = _loc1_.y;
         }
      }
      
      protected function removeInfoWindow() : *
      {
         if(this.contains(this.infoWindow))
         {
            this.removeChild(this.infoWindow);
         }
      }
   }
}

