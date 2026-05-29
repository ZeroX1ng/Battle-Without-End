package iData.iMonster
{
   import iData.iItem.EquipType;
   import iData.iItem.Equipment;
   import iData.iItem.EquipmentData;
   import iData.iItem.EquipmentList;
   import iData.iItem.Weapon;
   import iData.iItem.WeaponData;
   import iData.iPet.Pet;
   import iGlobal.Global;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   
   public class Boss extends Monster
   {
      
      public var hpleft:int;
      
      public function Boss(param1:MonsterData)
      {
         super(param1);
         this.hpleft = this.hp;
      }
      
      override protected function generateTitle() : void
      {
         this.title = MonsterTitleList.REGION_BOSS;
         addTitleStat();
      }
      
      override public function get CP() : int
      {
         return data.CP * 2;
      }
      
      override public function dropItem() : void
      {
         var _loc2_:Equipment = null;
         var _loc1_:EquipmentData = EquipmentList.list[EquipmentList.list.length * Math.random() >> 0];
         if(_loc1_ is WeaponData)
         {
            _loc2_ = new Weapon(_loc1_ as WeaponData,dropRate,true);
         }
         else
         {
            _loc2_ = new Equipment(_loc1_,dropRate,true);
         }
         var _loc3_:Boolean = false;
         if(!Global["item" + _loc2_.quality + "_toggle"])
         {
            _loc3_ = true;
         }
         if(!_loc3_)
         {
            if(_loc2_ is Weapon || _loc2_.type == EquipType.ACCESORY)
            {
               if(!Global[_loc2_.name + "_toggle"])
               {
                  _loc3_ = true;
               }
            }
            else if(!Global[_loc2_.position + "_" + _loc2_.type + "_toggle"])
            {
               _loc3_ = true;
            }
         }
         if(!_loc3_ && Player.addItem(_loc2_))
         {
            if(MainScene.lootPanel)
            {
               switch(_loc2_.quality)
               {
                  case 0:
                     ++MainScene.lootPanel.basic;
                     break;
                  case 1:
                     ++MainScene.lootPanel.magic;
                     break;
                  case 2:
                     ++MainScene.lootPanel.rare;
                     break;
                  case 3:
                     ++MainScene.lootPanel.perfect;
                     break;
                  case 4:
                     ++MainScene.lootPanel.epic;
                     break;
                  case 5:
                     ++MainScene.lootPanel.legendary;
               }
            }
         }
         else
         {
            _loc3_ = true;
         }
         if(_loc3_)
         {
            Player.addMoney(_loc2_.getMoney());
         }
      }
      
      override public function dropPet() : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:int = 0;
         var _loc1_:Number = 20 * (1 + Player.luck / 200);
         if(_loc1_ > 40)
         {
            _loc1_ = 40;
         }
         if(Math.random() * 100 < _loc1_)
         {
            _loc2_ = Player.luck / 500;
            if(_loc2_ > 1)
            {
               _loc2_ = 1;
            }
            _loc3_ = (1 + Global.map.mapData.modifier) * (1 + _loc2_);
            Player.addPet(new Pet(Global.map.mapData.petList[Global.map.mapData.petList.length * Math.random() >> 0],_loc3_));
         }
      }
   }
}

