package iPanel
{
   import flash.display.Sprite;
   
   public class InnerPanel extends Sprite
   {
      
      public function InnerPanel()
      {
         super();
      }
      
      public function set positionY(param1:Number) : *
      {
         this.y = param1;
      }
      
      public function get positionY() : Number
      {
         return this.y;
      }
   }
}

