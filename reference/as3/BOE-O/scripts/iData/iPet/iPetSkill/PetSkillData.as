package iData.iPet.iPetSkill
{
   public class PetSkillData
   {
      
      public var setList:Array;
      
      public var name:String;
      
      public var realName:String;
      
      public var behaveFunction:Function;
      
      public var desFunction:Function;
      
      public function PetSkillData(param1:String, param2:String, param3:Array, param4:Function, param5:Function)
      {
         super();
         this.setList = param3;
         this.name = param1;
         this.realName = param2;
         this.behaveFunction = param4;
         this.desFunction = param5;
      }
   }
}

