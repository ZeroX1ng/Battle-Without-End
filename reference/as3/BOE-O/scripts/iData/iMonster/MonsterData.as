package iData.iMonster
{
   import iData.iNumber.DamageNumber;
   
   public class MonsterData
   {
      
      public var name:String;
      
      public var realName:String;
      
      public var hp:Number;
      
      public var attack:DamageNumber;
      
      public var defence:Number;
      
      public var protection:Number;
      
      public var crit:Number;
      
      public var crit_mul:Number;
      
      public var balance:Number;
      
      public var CP:int;
      
      public function MonsterData(param1:String = "unknow", param2:String = "", param3:Number = 0, param4:Number = 0, param5:Number = 0, param6:Number = 0, param7:Number = 0, param8:Number = 0, param9:Number = 0, param10:Number = 0, param11:int = 0)
      {
         super();
         this.name = param1;
         this.realName = param2;
         this.hp = param3;
         this.attack = new DamageNumber(param4,param5);
         this.defence = param6;
         this.protection = param7;
         this.crit = param8;
         this.crit_mul = param9;
         this.balance = param10;
         this.CP = param11;
      }
      
      public function clone() : MonsterData
      {
         return new MonsterData(this.name,this.realName,this.hp,this.attack.min,this.attack.max,this.defence,this.protection,this.crit,this.crit_mul,this.balance,this.CP);
      }
   }
}

