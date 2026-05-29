package iPanel.iScene
{
   import flash.display.Sprite;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.ButtonCell;
   
   public class PeopleModel extends ButtonCell
   {
      
      public var age:int;
      
      public var bg:BasicCell = new BasicCell(50,100);
      
      public var bg2:BasicCell = new BasicCell(50,100);
      
      public var p:Sprite;
      
      public var p2:Sprite;
      
      public function PeopleModel(param1:int)
      {
         this.age = param1;
         this.bg2.transform.colorTransform = new ColorTransform(0.9,0.7,0,0.95);
         super("flash.display.Sprite","flash.display.Sprite");
         this.init();
      }
      
      private function init() : void
      {
         before.addChild(this.bg);
         after.addChild(this.bg2);
         this.p = new Sprite();
         this.p2 = new Sprite();
         before.addChild(this.p);
         after.addChild(this.p2);
         this.drawPeople(this.p,7631988);
         this.drawPeople(this.p2,16777215);
      }
      
      private function drawPeople(param1:Sprite, param2:uint) : *
      {
         var _loc3_:int = this.age - 10;
         param1.y = 15 - _loc3_ * 3;
         param1.graphics.beginFill(param2,1);
         param1.graphics.drawCircle(25,30,10);
         param1.graphics.drawRect(15,40,20,30 + _loc3_);
         param1.graphics.drawRect(15,70 + _loc3_,5,8 + _loc3_ * 2);
         param1.graphics.drawRect(30,70 + _loc3_,5,8 + _loc3_ * 2);
         param1.graphics.drawRect(9,40,5,15 + _loc3_ * 2);
         param1.graphics.drawRect(36,40,5,15 + _loc3_ * 2);
         param1.graphics.endFill();
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

