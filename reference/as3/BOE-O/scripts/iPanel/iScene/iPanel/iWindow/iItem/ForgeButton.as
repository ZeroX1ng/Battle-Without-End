package iPanel.iScene.iPanel.iWindow.iItem
{
   import flash.geom.ColorTransform;
   import iPanel.iCell.ButtonCell;
   
   public class ForgeButton extends ButtonCell
   {
      
      private const R:int = 50;
      
      public function ForgeButton()
      {
         super("mc_forge","mc_forge");
         after.transform.colorTransform = new ColorTransform(0,0,0,1,227,178,10,5);
         before.height = this.R;
         before.width = this.R;
         after.height = this.R;
         after.width = this.R;
      }
   }
}

