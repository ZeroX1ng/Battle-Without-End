package iPanel.iScene.iPanel.iWindow
{
   import flash.display.Sprite;
   import flash.events.Event;
   import iGlobal.Player;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   import iPanel.iScene.iPanel.iWindow.iEquip.EquipCell;
   import iPanel.iScene.iPanel.iWindow.iPet.PetIconCell;
   import iPanel.iScene.iPanel.iWindow.iPet.PetSkillCell;
   import tool.Effect;
   
   public class EquipWindow extends Window
   {
      
      private const SC:Number = 0.4;
      
      private const SY:int = 100;
      
      private var head:EquipCell;
      
      private var feet:EquipCell;
      
      private var body:EquipCell;
      
      private var necklace:EquipCell;
      
      private var ring:EquipCell;
      
      private var leftHand:EquipCell;
      
      private var rightHand:EquipCell;
      
      private var pet:PetIconCell;
      
      private var bg2:Sprite;
      
      private var spList:Array;
      
      private var petSp:Sprite;
      
      private var petSkillSp:Sprite;
      
      private var _name:StringCell;
      
      private var attack:StringCell;
      
      private var hp:StringCell;
      
      private var mp:StringCell;
      
      private var balance:StringCell;
      
      private var cri:StringCell;
      
      private var cri_mul:StringCell;
      
      private var magatt:StringCell;
      
      private var def:StringCell;
      
      private var pro:StringCell;
      
      public function EquipWindow()
      {
         super();
         var _loc1_:Sprite = new BasicCell(200,540);
         this.addChild(_loc1_);
         var _loc2_:Sprite = new people_use1();
         this.addChild(_loc2_);
         _loc2_.scaleX = this.SC;
         _loc2_.scaleY = this.SC;
         _loc2_.y = this.SY;
         this.bg2 = new people_use2();
         this.addChild(this.bg2);
         this.bg2.scaleX = this.SC;
         this.bg2.scaleY = this.SC;
         this.bg2.y = this.SY;
         this.spList = new Array();
         this.update();
         this.addEventListener(Event.ADDED_TO_STAGE,this.onAdd);
      }
      
      public function update() : *
      {
         var list:Array;
         var equipDown:Function;
         var i:int = 0;
         i = int(this.spList.length);
         while(i > 0)
         {
            this.bg2.removeChild(this.spList.pop());
            i--;
         }
         list = ["head","feet","body","necklace","ring","leftHand","rightHand"];
         i = 0;
         while(i < list.length)
         {
            equipDown = function():*
            {
               this.setBefore();
               if(this.equip)
               {
                  if(Player.addItem(this.equip))
                  {
                     Player[this.position] = null;
                     update();
                     Player.updateAllInfo();
                     Player.updateBattleSkillWindow();
                  }
               }
            };
            this[list[i]] = new EquipCell(Player[list[i]],list[i]);
            this.bg2.addChild(this[list[i]]);
            this.spList.push(this[list[i]]);
            (this[list[i]] as EquipCell).downFunction = equipDown;
            i++;
         }
         this.pet = new PetIconCell(Player.pet);
         this.bg2.addChild(this.pet);
         this.spList.push(this.pet);
         this.pet.x = 60;
         this.pet.y = 620;
         this.head.x = 210;
         this.head.y = -50;
         this.feet.x = 210;
         this.feet.y = 480;
         this.body.x = 390;
         this.body.y = 300;
         this.necklace.x = 380;
         this.necklace.y = 100;
         this.ring.x = 10;
         this.ring.y = 120;
         this.leftHand.x = 5;
         this.leftHand.y = 230;
         this.rightHand.x = 415;
         this.rightHand.y = 220;
         this.setPetInfo();
      }
      
      private function onAdd(param1:Event) : void
      {
         Effect.gradientInOutsideFirst(this.bg2,20,800,250,250);
      }
      
      private function setPetInfo() : *
      {
         if(this.petSp)
         {
            if(this.contains(this.petSp))
            {
               this.removeChild(this.petSp);
            }
         }
         if(this.petSkillSp)
         {
            if(this.contains(this.petSkillSp))
            {
               this.removeChild(this.petSkillSp);
            }
         }
         var _loc1_:int = 20;
         var _loc2_:int = 380;
         var _loc3_:int = 35;
         var _loc4_:int = 100;
         var _loc5_:int = 20;
         this.petSp = new Sprite();
         this.petSp.x = _loc1_;
         this.petSp.y = _loc2_;
         this.addChild(this.petSp);
         var _loc6_:Array = new Array();
         var _loc7_:StringCell = new StringCell("宠物",100,16);
         _loc6_.push(_loc7_);
         this._name = new StringCell("Fox",150);
         _loc6_.push(this._name);
         _loc6_.push(new StringCell("Hp"));
         _loc6_.push(this.hp = new StringCell("100"));
         _loc6_.push(new StringCell("Mp"));
         _loc6_.push(this.mp = new StringCell("100"));
         _loc6_.push(new StringCell("攻击"));
         _loc6_.push(this.attack = new StringCell("20~30",65));
         _loc6_.push(new StringCell("平衡"));
         _loc6_.push(this.balance = new StringCell("50"));
         _loc6_.push(new StringCell("暴击"));
         _loc6_.push(this.cri = new StringCell("50"));
         _loc6_.push(new StringCell("暴倍"));
         _loc6_.push(this.cri_mul = new StringCell("200%"));
         _loc6_.push(new StringCell("防御"));
         _loc6_.push(this.def = new StringCell("10"));
         _loc6_.push(new StringCell("护甲"));
         _loc6_.push(this.pro = new StringCell("10"));
         _loc6_.push(new StringCell("魔攻"));
         _loc6_.push(this.magatt = new StringCell("100%"));
         var _loc8_:int = int(_loc6_.length);
         var _loc9_:int = 0;
         while(_loc9_ < _loc8_)
         {
            this.petSp.addChild(_loc6_[_loc9_]);
            _loc6_[_loc9_].x = _loc3_ * (_loc9_ % 2) + _loc4_ * (_loc9_ / 10 >> 0);
            _loc6_[_loc9_].y = _loc5_ + _loc5_ * (_loc9_ % 10 / 2 >> 0);
            _loc9_++;
         }
         this.petSkillSp = new Sprite();
         this.petSkillSp.x = 10;
         this.petSkillSp.y = 500;
         this.addChild(this.petSkillSp);
         this.updatePetInfo();
      }
      
      public function updatePetInfo() : *
      {
         var _loc1_:* = 0;
         var _loc2_:PetSkillCell = null;
         if(!Player.pet)
         {
            this.petSp.visible = false;
            this.petSkillSp.visible = false;
            return;
         }
         this.petSp.visible = true;
         this.petSkillSp.visible = true;
         this._name.setText(Player.pet.realName);
         this.hp.setText(Player.pet.hp + "");
         this.mp.setText(Player.pet.mp + "");
         this.attack.setText(Player.pet.attmin + "~" + Player.pet.attmax + "");
         this.balance.setText(Player.pet.balance + "");
         this.cri.setText(Player.pet.cri + "");
         this.def.setText(Player.pet.defence + "");
         this.pro.setText(Player.pet.pro + "");
         this.magatt.setText(Player.pet.magicatt + "%");
         this.cri_mul.setText(Player.pet.crimul + "%");
         _loc1_ = int(this.petSkillSp.numChildren - 1);
         while(_loc1_ >= 0)
         {
            this.petSkillSp.removeChildAt(_loc1_);
            _loc1_--;
         }
         _loc1_ = 0;
         while(_loc1_ < Player.pet.skillList.length)
         {
            _loc2_ = new PetSkillCell(Player.pet.skillList[_loc1_]);
            this.petSkillSp.addChild(_loc2_);
            _loc2_.x = _loc1_ * 30 + 2 + _loc1_ * 10;
            _loc1_++;
         }
      }
   }
}

