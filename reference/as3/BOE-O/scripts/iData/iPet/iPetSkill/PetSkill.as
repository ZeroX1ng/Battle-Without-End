package iData.iPet.iPetSkill
{
   import flash.utils.getDefinitionByName;
   
   public class PetSkill
   {
      
      public var skillData:PetSkillData;
      
      public var level:int = 0;
      
      public function PetSkill(param1:PetSkillData)
      {
         super();
         this.skillData = param1;
         this.level = Math.random() * 2;
      }
      
      public static function load(param1:String) : PetSkill
      {
         var _loc3_:PetSkill = null;
         var _loc2_:Array = param1.split("$");
         var _loc4_:int = 0;
         while(_loc4_ < PetSkillList.list.length)
         {
            if(PetSkillList.list[_loc4_].name == _loc2_[0])
            {
               _loc3_ = new PetSkill(PetSkillList.list[_loc4_]);
            }
            _loc4_++;
         }
         _loc3_.level = _loc2_[1];
         return _loc3_;
      }
      
      public function getName() : String
      {
         if(this.level)
         {
            return "Advanced " + this.skillData.name;
         }
         return this.skillData.name;
      }
      
      public function getRealName() : String
      {
         if(this.level)
         {
            return "进阶" + this.skillData.realName;
         }
         return this.skillData.realName;
      }
      
      public function getSetArray() : Array
      {
         if(this.level)
         {
            return this.skillData.setList[1];
         }
         return this.skillData.setList[0];
      }
      
      public function save() : String
      {
         var _loc1_:String = "";
         return _loc1_ + (this.skillData.name + "$" + this.level);
      }
   }
}

