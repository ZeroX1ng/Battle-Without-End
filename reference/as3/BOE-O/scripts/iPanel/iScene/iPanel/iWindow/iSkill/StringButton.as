package iPanel.iScene.iPanel.iWindow.iSkill
{
   import flash.display.Sprite;
   import flash.filters.GlowFilter;
   import flash.text.TextField;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.ButtonCell;
   
   public class StringButton extends ButtonCell
   {
      
      private var bg:Sprite = new BasicCell(66,25);
      
      private var text:String;
      
      private var color:uint;
      
      public function StringButton(param1:String, param2:uint)
      {
         this.addChild(this.bg);
         super("flash.display.Sprite","flash.display.Sprite");
         this.text = param1;
         this.color = param2;
         this.init();
      }
      
      private function init() : *
      {
         var _loc1_:TextField = Global.getTextField(18);
         _loc1_.htmlText = "<p align=\'center\'>" + this.text + "</p>";
         _loc1_.width = 60;
         this.before.addChild(_loc1_);
         _loc1_.x = 2;
         _loc1_.y = 2;
         var _loc2_:TextField = Global.getTextField(18);
         _loc2_.htmlText = "<p align=\'center\'>" + this.text + "</p>";
         _loc2_.width = 60;
         this.after.addChild(_loc2_);
         _loc2_.x = 2;
         _loc2_.y = 2;
         _loc2_.textColor = this.color;
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         this.filters = [];
      }
      
      override public function setDown() : void
      {
         super.setDown();
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
      }
   }
}

