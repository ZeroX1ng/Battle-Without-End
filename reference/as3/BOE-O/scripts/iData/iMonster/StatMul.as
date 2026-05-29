package iData.iMonster
{
   import iData.iItem.Stat;
   
   public class StatMul
   {
      
      public var name:String;
      
      public var mul:Number;
      
      public var add:Number;
      
      public function StatMul(param1:String, param2:Number, param3:Number = 0)
      {
         super();
         this.name = param1;
         this.mul = param2;
         this.add = param3;
      }
      
      public function statTranslate() : String
      {
         switch(this.name)
         {
            case Stat.intelligence:
               return "智力";
            case Stat.attackMin:
               return "最小攻击";
            case Stat.attackMax:
               return "最大攻击";
            case Stat.ATTACK:
               return "攻击";
            case Stat.crit_mul:
               return "暴击倍数";
            case Stat.spellChance:
               return "释放概率";
            case Stat.protectionIgnore:
               return "无视护甲";
            case Stat.protectionReduce:
               return "降低护甲";
            case Stat.magicDamage:
               return "魔法伤害";
            case Stat.str:
               return "力量";
            case Stat.dex:
               return "敏捷";
            case Stat.will:
               return "意志";
            case Stat.luck:
               return "幸运";
            case Stat.balance:
               return "平衡";
            case Stat.crit:
               return "暴击";
            case Stat.defence:
               return "防御";
            case Stat.protection:
               return "护甲";
            default:
               return this.name;
         }
      }
   }
}

