package iData.iSkill
{
   import iData.iItem.Stat;
   
   public class ActiveSkillData extends SkillData
   {
      
      public var type:String;
      
      public var setList:Array;
      
      public var behaveFunction:Function;
      
      public function ActiveSkillData(param1:String, param2:String, param3:String, param4:String, param5:Vector.<Vector.<Stat>>, param6:Vector.<Vector.<Stat>>, param7:Vector.<int>, param8:Array, param9:Function, param10:Function = null)
      {
         super(param1,param2,param4,param5,param6,param7,param9);
         this.type = param3;
         this.setList = param8;
         this.behaveFunction = param10;
      }
   }
}

