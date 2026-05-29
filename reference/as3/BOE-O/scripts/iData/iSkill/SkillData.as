package iData.iSkill
{
   import iData.iItem.Stat;
   
   public class SkillData
   {
      
      public var name:String;
      
      public var realName:String;
      
      public var category:String;
      
      public var statList:Vector.<Vector.<Stat>>;
      
      public var effectList:Vector.<Vector.<Stat>>;
      
      public var lvupCostList:Vector.<int>;
      
      public var desFunction:Function;
      
      public function SkillData(param1:String, param2:String, param3:String, param4:Vector.<Vector.<Stat>>, param5:Vector.<Vector.<Stat>>, param6:Vector.<int>, param7:Function)
      {
         super();
         this.name = param1;
         this.realName = param2;
         this.category = param3;
         this.statList = param4;
         this.effectList = param5;
         this.lvupCostList = param6;
         this.desFunction = param7;
      }
   }
}

