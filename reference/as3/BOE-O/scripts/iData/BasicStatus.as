package iData
{
   import iData.iNumber.DamageNumber;
   
   public class BasicStatus
   {
      
      public var hp:Number;
      
      public var mp:Number;
      
      public var str:Number;
      
      public var dex:Number;
      
      public var intelligence:Number;
      
      public var will:Number;
      
      public var luck:Number;
      
      public var attack:DamageNumber;
      
      public var balance:Number;
      
      public var crit:Number;
      
      public var crit_mul:Number;
      
      public var defence:Number;
      
      public var protection:Number;
      
      public var spellChance:Number;
      
      public var manaConsumption:Number;
      
      public var protectionIgnore:Number;
      
      public var protectionReduce:Number;
      
      public var magicDamage:Number;
      
      public function BasicStatus(param1:Number, param2:Number, param3:Number, param4:Number, param5:Number, param6:Number, param7:Number, param8:Number = 0, param9:Number = 0, param10:Number = 0, param11:Number = 0, param12:Number = 0, param13:Number = 0, param14:Number = 0, param15:Number = 0, param16:Number = 0, param17:Number = 0, param18:Number = 0)
      {
         super();
         this.hp = param1;
         this.mp = param2;
         this.str = param3;
         this.dex = param4;
         this.intelligence = param5;
         this.will = param6;
         this.luck = param7;
         this.attack = new DamageNumber(param8,param9);
         this.balance = param10;
         this.crit = param11;
         this.crit_mul = param12;
         this.defence = param13;
         this.protection = param14;
         this.spellChance = param15;
         this.protectionIgnore = param16;
         this.protectionReduce = param17;
         this.magicDamage = param18;
      }
      
      public function clone() : BasicStatus
      {
         return new BasicStatus(this.hp,this.mp,this.str,this.dex,this.intelligence,this.will,this.luck,this.attack.min,this.attack.max,this.balance,this.crit,this.crit_mul,this.defence,this.protection,this.spellChance,this.protectionIgnore,this.protectionReduce);
      }
   }
}

