package iPanel.iCell
{
   import flash.filters.GlowFilter;
   
   public class InfoWindow extends BasicCell
   {
      
      public function InfoWindow(param1:int, param2:int)
      {
         super(param1,param2);
         this.mouseEnabled = false;
         this.mouseChildren = false;
      }
      
      override public function draw(param1:int, param2:int) : *
      {
         this.graphics.lineStyle(1,13487565,0.8);
         super.draw(param1,param2);
         this.filters = [new GlowFilter(5066061,0.66,13,13)];
      }
   }
}

