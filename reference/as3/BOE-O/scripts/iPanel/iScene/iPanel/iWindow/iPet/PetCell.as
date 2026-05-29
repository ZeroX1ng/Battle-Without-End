package iPanel.iScene.iPanel.iWindow.iPet
{
   import flash.display.Sprite;
   import flash.geom.ColorTransform;
   import flash.utils.getDefinitionByName;
   import iData.iPet.Pet;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iCell.AdvancedCell;
   import iPanel.iCell.EquipButton;
   import tool.MyEvent;
   
   public class PetCell extends AdvancedCell
   {
      
      public var pet:Pet;
      
      protected var be_mc:Sprite;
      
      protected var af_mc:Sprite;
      
      public function PetCell(param1:Pet)
      {
         this.pet = param1;
         super(200,50);
         this.init();
      }
      
      private function init() : void
      {
         this.be_mc = new (getDefinitionByName("pet_" + this.pet.mc_name) as Class)();
         before.addChild(this.be_mc);
         this.be_mc.width = 30;
         this.be_mc.height = 30;
         this.be_mc.x = 10;
         this.be_mc.y = 10;
         this.af_mc = new (getDefinitionByName("pet_" + this.pet.mc_name) as Class)();
         after.addChild(this.af_mc);
         this.af_mc.width = 30;
         this.af_mc.height = 30;
         this.af_mc.x = 10;
         this.af_mc.y = 10;
         this.af_mc.transform.colorTransform = new ColorTransform(1,1,1,1,255,255,255,0);
         text = Global.getTextField(20);
         text.width = 120;
         text.htmlText = this.pet.realName;
         if(this.pet.level)
         {
            text.htmlText += " Lv." + this.pet.level;
         }
         this.addChild(text);
         text.x = 50;
         text.y = 10;
         this.setEquipButton();
         this.setMoneyButton();
         this.infoWindow = new PetInfoWindow(this.pet);
      }
      
      protected function setEquipButton() : void
      {
         var equipDown:Function = null;
         equipDown = function():void
         {
            Player.removePet(pet);
            Player.setPet(pet);
            dispatchEvent(new MyEvent(MyEvent.Update));
         };
         var equipButton:EquipButton = new EquipButton("equip");
         this.addChild(equipButton);
         equipButton.x = 150;
         equipButton.y = 15;
         equipButton.downFunction = equipDown;
      }
      
      protected function setMoneyButton() : void
      {
         var moneyDown:Function = null;
         moneyDown = function():void
         {
            Player.removePet(pet);
            dispatchEvent(new MyEvent(MyEvent.Update));
         };
         var moneyButton:EquipButton = new EquipButton("money");
         this.addChild(moneyButton);
         moneyButton.x = 172;
         moneyButton.y = 15;
         moneyButton.downFunction = moneyDown;
      }
      
      public function update() : *
      {
         this.infoWindow.draw(0,0);
         text.htmlText = this.pet.realName;
         if(this.pet.level)
         {
            text.htmlText += " Lv." + this.pet.level;
         }
      }
   }
}

