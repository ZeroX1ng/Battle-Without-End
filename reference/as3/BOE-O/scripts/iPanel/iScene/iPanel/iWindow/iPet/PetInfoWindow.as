package iPanel.iScene.iPanel.iWindow.iPet
{
   import flash.display.Sprite;
   import flash.text.TextField;
   import iData.iPet.Pet;
   import iData.iPet.PetType;
   import iGlobal.Global;
   import iPanel.iBar.Bar;
   import iPanel.iCell.InfoWindow;
   
   public class PetInfoWindow extends InfoWindow
   {
      
      private var pet:Pet;
      
      private var xp:Bar;
      
      private var skillMcList:Sprite;
      
      private var textTitle:TextField = Global.getTextField(24);
      
      public function PetInfoWindow(param1:Pet)
      {
         this.textTitle.multiline = true;
         this.addChild(this.textTitle);
         this.pet = param1;
         super(0,0);
         this.mouseEnabled = true;
         this.mouseChildren = true;
      }
      
      override public function draw(param1:int, param2:int) : *
      {
         this.graphics.clear();
         this.textTitle.width = 130;
         this.textTitle.htmlText = this.petInfo();
         this.setSkill();
         super.draw(130,this.textTitle.textHeight + 5 + 40);
      }
      
      private function getType() : String
      {
         switch(this.pet.type)
         {
            case PetType.ATTACK:
               return "攻击型";
            case PetType.BALANCE:
               return "平衡型";
            case PetType.DEFENCE:
               return "防御型";
            case PetType.MAGIC:
               return "魔法型";
            default:
               return this.pet.type;
         }
      }
      
      public function petInfo() : String
      {
         var _loc1_:String = "<p align=\'center\'>" + this.pet.realName + " Lv." + this.pet.level + "</p>";
         _loc1_ += "<p align=\'center\'><font size=\'20\'>" + this.getType() + "</font></p>";
         _loc1_ += "<font size=\'16\'>";
         _loc1_ += "  Hp\t" + this.pet.hp + "<br/>";
         _loc1_ += "  Mp\t" + this.pet.mp + "<br/>";
         _loc1_ += "  攻击\t" + this.pet.attmin + "~" + this.pet.attmax + "<br/>";
         _loc1_ += "  平衡\t" + this.pet.balance + "<br/>";
         _loc1_ += "  暴击率\t" + this.pet.cri + "%<br/>";
         _loc1_ += "  暴击倍数\t" + this.pet.crimul + "%<br/>";
         _loc1_ += "  防御\t" + this.pet.defence + "<br/>";
         _loc1_ += "  护甲\t" + this.pet.pro + "<br/>";
         _loc1_ += "  魔法攻击\t" + this.pet.magicatt + "%<br/>";
         return _loc1_ + "</font>";
      }
      
      private function setSkill() : *
      {
         var _loc2_:PetSkillCell = null;
         var _loc1_:int = 0;
         while(_loc1_ < this.pet.skillList.length)
         {
            _loc2_ = new PetSkillCell(this.pet.skillList[_loc1_]);
            this.addChild(_loc2_);
            _loc2_.x = _loc1_ * 30 + 2 + _loc1_ * 2;
            _loc2_.y = this.textTitle.textHeight + 5;
            _loc1_++;
         }
      }
   }
}

