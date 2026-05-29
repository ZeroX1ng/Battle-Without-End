package iPanel.iScene.iPanel.iAllInfo
{
   import flash.display.Sprite;
   import iPanel.InnerPanel;
   import iPanel.iCell.StringCell;
   
   public class AllInfoInnerPanel extends InnerPanel
   {
      
      public var list:Vector.<StringCell>;
      
      public var listSprite:Sprite;
      
      private var bg:Sprite;
      
      public function AllInfoInnerPanel()
      {
         super();
         this.init();
      }
      
      private function init() : *
      {
         this.list = new Vector.<StringCell>();
         this.listSprite = new Sprite();
         this.bg = new Sprite();
         this.addChild(this.bg);
         this.addChild(this.listSprite);
      }
      
      public function addText(param1:String) : *
      {
         var _loc2_:StringCell = new StringCell(this.getTime() + param1,385,16);
         if(this.list.length > 100)
         {
            this.listSprite.removeChild(this.list.shift());
         }
         this.list.push(_loc2_);
         this.listSprite.addChild(_loc2_);
         this.tidy();
      }
      
      private function tidy() : *
      {
         var _loc1_:int = int(this.list.length);
         var _loc2_:int = 0;
         while(_loc2_ < this.list.length)
         {
            this.list[_loc2_].y = _loc2_ * 20;
            this.list[_loc2_].x = 10;
            _loc2_++;
         }
         if(this.height > 360 && this.list.length < 100)
         {
            this.y -= 20;
         }
         this.drawBg();
      }
      
      private function getTime() : String
      {
         var _loc1_:Date = new Date();
         return "[" + _loc1_.getHours() + ":" + _loc1_.getMinutes() + ":" + _loc1_.getSeconds() + "]";
      }
      
      private function drawBg() : *
      {
         this.bg.graphics.clear();
         this.bg.graphics.beginFill(16777215,0);
         this.bg.graphics.drawRect(0,0,400,this.height);
         this.bg.graphics.endFill();
      }
   }
}

