package iPanel.iCell
{
   import flash.display.Sprite;
   
   public class BasicCell extends Sprite
   {
      
      public function BasicCell(param1:int, param2:int)
      {
         super();
         this.draw(param1,param2);
      }
      
      public function draw(param1:int, param2:int) : *
      {
         this.graphics.beginFill(16777215,0.95);
         this.graphics.drawRect(0,0,param1,param2);
         this.graphics.endFill();
      }
   }
}

