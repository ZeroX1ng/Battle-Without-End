package iData.iSkill
{
   import iData.iPlayer.TitleList;
   import iGlobal.Player;
   import iPanel.iScene.MainScene;
   
   public class Skill
   {
      
      public var level:int;
      
      public var skillData:SkillData;
      
      public function Skill(param1:SkillData)
      {
         super();
         this.skillData = param1;
         this.level = 0;
      }
      
      public static function load(param1:String) : Skill
      {
         var _loc3_:Skill = null;
         var _loc2_:Array = param1.split("#");
         var _loc4_:int = 0;
         while(_loc4_ < SkillDataList.list.length)
         {
            if(SkillDataList.list[_loc4_].name == _loc2_[1])
            {
               if(SkillDataList.list[_loc4_] is PassiveSkillData)
               {
                  _loc3_ = new PassiveSkill(SkillDataList.list[_loc4_] as PassiveSkillData);
               }
               else
               {
                  _loc3_ = new ActiveSkill(SkillDataList.list[_loc4_] as ActiveSkillData);
               }
               break;
            }
            _loc4_++;
         }
         _loc3_.level = _loc2_[0];
         return _loc3_;
      }
      
      public function getDescription() : String
      {
         if(Boolean(this.skillData.desFunction))
         {
            return this.skillData.desFunction(this);
         }
         return "no function";
      }
      
      public function levelup() : void
      {
         Player.addAp(-this.skillData.lvupCostList[this.level + 1]);
         ++this.level;
         MainScene.allInfoPanel.addText("<font color=\'#FF4040\'>Skill " + this.skillData.name + " level up to " + (15 - this.level).toString(16).toUpperCase() + "!</font>.");
         if(this.level == 14)
         {
            TitleList.updateTitleInfo(this.skillData.name);
         }
      }
      
      public function canLevelup() : Boolean
      {
         if(this.level >= 14)
         {
            return false;
         }
         if(this.skillData.lvupCostList[this.level + 1] > Player.ap)
         {
            return false;
         }
         return true;
      }
      
      public function save() : String
      {
         var _loc1_:String = "";
         return _loc1_ + (this.level + "#" + this.skillData.name);
      }
   }
}

