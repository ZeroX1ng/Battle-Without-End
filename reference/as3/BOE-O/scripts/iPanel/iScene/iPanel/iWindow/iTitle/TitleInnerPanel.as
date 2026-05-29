package iPanel.iScene.iPanel.iWindow.iTitle
{
   import flash.display.Sprite;
   import flash.events.Event;
   import iData.iPlayer.Title;
   import iData.iPlayer.TitleList;
   import iPanel.InnerPanel;
   import tool.MyEvent;
   
   public class TitleInnerPanel extends InnerPanel
   {
      
      private const Gap:int = 50;
      
      private var listSprite:Sprite;
      
      public function TitleInnerPanel()
      {
         var _loc4_:TitleCell = null;
         super();
         this.listSprite = new Sprite();
         this.addChild(this.listSprite);
         var _loc1_:Vector.<Title> = TitleList.list;
         var _loc2_:int = int(_loc1_.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            _loc4_ = new TitleCell(_loc1_[_loc3_]);
            this.listSprite.addChild(_loc4_);
            _loc4_.y = this.Gap * _loc3_;
            _loc3_++;
         }
         addEventListener(MyEvent.Update,this.onUpdate,true);
      }
      
      public function onUpdate(param1:Event = null) : void
      {
         var _loc2_:int = 0;
         while(_loc2_ < this.listSprite.numChildren)
         {
            (this.listSprite.getChildAt(_loc2_) as TitleCell).update();
            _loc2_++;
         }
      }
   }
}

