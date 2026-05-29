package iPanel.iCell
{
   public class ButtonGroup
   {
      
      private var buttonList:Vector.<ButtonCell> = new Vector.<ButtonCell>();
      
      public function ButtonGroup()
      {
         super();
      }
      
      public function addButton(param1:ButtonCell) : Boolean
      {
         var _loc2_:int = int(this.buttonList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.buttonList[_loc3_] == param1)
            {
               return false;
            }
            _loc3_++;
         }
         this.buttonList.push(param1);
         param1.buttonGroup = this;
         return true;
      }
      
      internal function setDown(param1:ButtonCell) : void
      {
         var _loc2_:int = int(this.buttonList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.buttonList[_loc3_] == param1)
            {
               param1.setDown();
            }
            else
            {
               this.buttonList[_loc3_].setBefore();
            }
            _loc3_++;
         }
      }
   }
}

