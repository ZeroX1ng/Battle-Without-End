package iPanel.iScene.iPanel.iWindow.iPet
{
   import flash.display.Sprite;
   import flash.utils.getDefinitionByName;
   import iData.iPet.Pet;
   import iPanel.iCell.ButtonCell;
   
   public class PetIconCell extends ButtonCell
   {
      
      private const SIZE:int = 80;
      
      public function PetIconCell(param1:Pet = null)
      {
         var _loc2_:Sprite = null;
         var _loc3_:Sprite = null;
         super("flash.display.Sprite","flash.display.Sprite");
         if(param1 == null)
         {
            _loc2_ = new mc_mode();
         }
         else
         {
            _loc2_ = new (getDefinitionByName("pet_" + param1.mc_name) as Class)();
         }
         before.addChild(_loc2_);
         _loc2_.width = this.SIZE;
         _loc2_.height = this.SIZE;
         if(param1 == null)
         {
            _loc3_ = new mc_mode();
         }
         else
         {
            _loc3_ = new (getDefinitionByName("pet_" + param1.mc_name) as Class)();
         }
         after.addChild(_loc3_);
         _loc3_.width = this.SIZE;
         _loc3_.height = this.SIZE;
      }
   }
}

