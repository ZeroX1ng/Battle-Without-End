package iPanel.iScene.iPanel
{
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.FlickerButton;
   
   public class ComfirmScene extends BasicCell
   {
      
      private var text:StringCell;
      
      public function ComfirmScene(param1:String, param2:Function)
      {
         var ok:FlickerButton;
         var no:FlickerButton;
         var _this:* = undefined;
         var noDown:Function = null;
         var str:String = param1;
         var behaveFunction:Function = param2;
         noDown = function():*
         {
            _this.parent.removeChild(_this);
            this.setBefore();
         };
         super(300,200);
         this.graphics.lineStyle(2,7631988);
         this.graphics.drawRect(0,0,300,200);
         this.text = new StringCell(str,250,32);
         this.addChild(this.text);
         this.text.x = 150 - this.text.width / 2;
         this.text.y = 50 - this.text.height / 2;
         ok = new FlickerButton("SURE",100,50);
         this.addChild(ok);
         ok.x = 30;
         ok.y = 120;
         ok.downFunction = behaveFunction;
         no = new FlickerButton("CANCEL",100,50);
         this.addChild(no);
         no.x = 170;
         no.y = 120;
         no.downFunction = noDown;
         _this = this;
      }
   }
}

