package iPanel.iScene.iPanel.iWindow.iPet
{
   import flash.display.Sprite;
   import flash.events.Event;
   import iGlobal.Player;
   import iPanel.InnerPanel;
   import iPanel.iCell.ButtonGroup;
   import tool.MyEvent;
   
   public class PetInnerPanel extends InnerPanel
   {
      
      private const Gap:int = 50;
      
      public var selectCell:PetCell;
      
      public var buttonGroup:ButtonGroup;
      
      private var listSprite:Sprite;
      
      public function PetInnerPanel()
      {
         super();
         this.update();
         this.addEventListener(MyEvent.Update,this.onUpdate,true);
      }
      
      private function onUpdate(param1:Event) : *
      {
         this.update();
      }
      
      public function update() : *
      {
         this.updateList();
      }
      
      private function updateList() : *
      {
         var _loc3_:PetCell = null;
         if(this.listSprite)
         {
            this.removeChild(this.listSprite);
         }
         this.listSprite = new Sprite();
         this.addChild(this.listSprite);
         this.buttonGroup = new ButtonGroup();
         var _loc1_:int = int(Player.petList.length);
         var _loc2_:int = 0;
         while(_loc2_ < _loc1_)
         {
            _loc3_ = new PetCell(Player.petList[_loc2_]);
            this.listSprite.addChild(_loc3_);
            _loc3_.y = _loc2_ * this.Gap;
            this.buttonGroup.addButton(_loc3_);
            _loc2_++;
         }
      }
   }
}

