package iPanel.iScene
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.text.TextField;
   import iData.Race;
   import iGlobal.Global;
   import iPanel.iCell.ButtonCell;
   
   public class RaceButton extends ButtonCell
   {
      
      private const PX:int = 50;
      
      private var bg:Sprite = new Sprite();
      
      private var count:int = 0;
      
      public var race:Race;
      
      private var text:TextField;
      
      public function RaceButton(param1:String, param2:String, param3:Race)
      {
         this.race = param3;
         this.addChild(this.bg);
         super(param1,param2);
         this.before.width = this.PX;
         this.before.height = this.PX;
         this.after.height = this.PX;
         this.after.width = this.PX;
         this.setText();
      }
      
      private function setText() : void
      {
         this.text = Global.getTextField(32,16777215);
         this.text.width = 200;
         this.text.text = this.race.name.toUpperCase();
         this.addChild(this.text);
         this.text.x = 100;
         this.text.y = 5;
         this.text.visible = false;
      }
      
      override public function setAfter() : void
      {
         super.setAfter();
         this.addEventListener(Event.ENTER_FRAME,this.overAnimation);
      }
      
      private function overAnimation(param1:Event) : void
      {
         if(this.count <= 10)
         {
            this.bg.graphics.clear();
            this.bg.graphics.beginFill(16777215,0.95);
            this.bg.graphics.drawRect(0 - this.count,0 - this.count,this.PX + this.count * 2,this.PX + this.count * 2);
            this.bg.graphics.endFill();
            this.bg.filters = [new GlowFilter(5066061,0.66,13,13)];
            this.bg.transform.colorTransform = new ColorTransform(1 - 0.01 * this.count,1 - 0.03 * this.count,1 - 0.1 * this.count,0.1 * this.count);
         }
         if(this.count > 10)
         {
            this.bg.graphics.clear();
            this.bg.graphics.beginFill(16777215,0.95);
            this.bg.graphics.drawRect(-10,-10,this.PX + 20 + 20 * (this.count - 10),this.PX + 20);
            this.bg.graphics.endFill();
            this.bg.filters = [new GlowFilter(5066061,0.66,13 + (this.count - 10) * 1,13 + (this.count - 10) * 1)];
            this.bg.transform.colorTransform = new ColorTransform(0.9,0.7,0,0.95);
            this.text.visible = true;
            this.text.alpha = (this.count - 10) * 0.1;
            this.text.filters = [new GlowFilter(16777215,0.66,13 + (this.count - 10) * 1,13 + (this.count - 10) * 1)];
         }
         ++this.count;
         if(this.count > 20)
         {
            this.removeEventListener(Event.ENTER_FRAME,this.overAnimation);
         }
      }
      
      override public function setBefore() : void
      {
         super.setBefore();
         this.bg.graphics.clear();
         this.removeEventListener(Event.ENTER_FRAME,this.overAnimation);
         this.count = 0;
         this.filters = [];
         this.text.visible = false;
      }
      
      override public function setDown() : void
      {
         super.setDown();
         this.filters = [new GlowFilter(10027008,0.66,23,23)];
      }
   }
}

