package iPanel.iScene
{
   import flash.events.Event;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.text.TextField;
   import iGlobal.Global;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.ButtonCell;
   
   public class FlickerButton extends ButtonCell
   {
      
      private var bg:BasicCell;
      
      private var count:int = 0;
      
      private var flag:Boolean = true;
      
      private var flickerTime:int = 30;
      
      public function FlickerButton(param1:String, param2:int, param3:int, param4:int = 32)
      {
         this.bg = new BasicCell(param2,param3);
         this.addChild(this.bg);
         super("flash.display.Sprite","flash.display.Sprite");
         var _loc5_:TextField = Global.getTextField(param4);
         _loc5_.width = param2;
         _loc5_.text = param1;
         before.addChild(_loc5_);
         before.x = param2 / 2 - _loc5_.textWidth / 2;
         before.y = param3 / 2 - _loc5_.textHeight / 2;
         var _loc6_:TextField = Global.getTextField(param4,16777215);
         _loc6_.width = param2;
         _loc6_.text = param1;
         after.addChild(_loc6_);
         after.x = param2 / 2 - _loc6_.textWidth / 2;
         after.y = param3 / 2 - _loc6_.textHeight / 2;
      }
      
      override public function setAfter() : void
      {
         super.setAfter();
         this.addEventListener(Event.ENTER_FRAME,this.overAnimation);
      }
      
      private function overAnimation(param1:Event) : void
      {
         if(this.count <= this.flickerTime)
         {
            this.filters = [new GlowFilter(5066061,0.66,13 + this.count,13 + this.count)];
            this.bg.transform.colorTransform = new ColorTransform(1 - 0.1 / this.flickerTime * this.count,1 - 0.3 / this.flickerTime * this.count,1 - 1 / this.flickerTime * this.count,0.01 + 1 / this.flickerTime * this.count);
         }
         if(this.count > this.flickerTime)
         {
            this.flag = false;
         }
         else if(this.count <= 0)
         {
            this.flag = true;
         }
         if(this.flag)
         {
            ++this.count;
         }
         else
         {
            --this.count;
         }
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         this.removeEventListener(Event.ENTER_FRAME,this.overAnimation);
         this.count = 0;
         this.bg.transform.colorTransform = new ColorTransform();
         this.filters = [];
         if(this.parent)
         {
            this.parent.addChildAt(this,this.parent.numChildren - 1);
         }
      }
      
      override public function setDown() : void
      {
         super.setDown();
         this.removeEventListener(Event.ENTER_FRAME,this.overAnimation);
      }
   }
}

