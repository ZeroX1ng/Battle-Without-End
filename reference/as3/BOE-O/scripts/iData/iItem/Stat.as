package iData.iItem
{
   import flash.utils.getDefinitionByName;
   
   public class Stat
   {
      
      public static const ATTACK:String = "ATTACK";
      
      public static const hp:String = "hp";
      
      public static const mp:String = "mp";
      
      public static const str:String = "str";
      
      public static const dex:String = "dex";
      
      public static const intelligence:String = "intelligence";
      
      public static const will:String = "will";
      
      public static const luck:String = "luck";
      
      public static const attackMin:String = "attackMin";
      
      public static const attackMax:String = "attackMax";
      
      public static const balance:String = "balance";
      
      public static const crit:String = "crit";
      
      public static const crit_mul:String = "crit_mul";
      
      public static const defence:String = "defence";
      
      public static const protection:String = "protection";
      
      public static const spellChance:String = "spellChance";
      
      public static const manaConsumption:String = "manaComsuption";
      
      public static const protectionIgnore:String = "protectionIgnore";
      
      public static const protectionReduce:String = "protectionReduce";
      
      public static const magicDamage:String = "magicDamage";
      
      public var name:String;
      
      public var value:Number;
      
      public function Stat(param1:String, param2:Number)
      {
         super();
         this.name = param1;
         this.value = param2;
      }
      
      public static function generate(param1:RangeStat, param2:Number) : Stat
      {
         return new Stat(param1.name,((param1.valueMin + param1.changeRange * Math.random() * param2 * Math.random()) * 100 >> 0) / 100);
      }
      
      public static function load(param1:String) : Stat
      {
         var _loc2_:Array = param1.split("$");
         return new Stat(_loc2_[0],_loc2_[1]);
      }
      
      public function clone() : Stat
      {
         return new Stat(this.name,this.value);
      }
      
      public function statTranslate() : String
      {
         switch(this.name)
         {
            case intelligence:
               return "智力";
            case attackMin:
               return "最小攻击";
            case attackMax:
               return "最大攻击";
            case ATTACK:
               return "攻击";
            case crit_mul:
               return "暴击倍数";
            case spellChance:
               return "释放概率";
            case protectionIgnore:
               return "无视护甲";
            case protectionReduce:
               return "降低护甲";
            case magicDamage:
               return "魔法伤害";
            case str:
               return "力量";
            case dex:
               return "敏捷";
            case will:
               return "意志";
            case luck:
               return "幸运";
            case balance:
               return "平衡";
            case crit:
               return "暴击";
            case defence:
               return "防御";
            case protection:
               return "护甲";
            default:
               return this.name;
         }
      }
      
      public function save() : String
      {
         var _loc1_:String = "";
         return _loc1_ + (this.name + "$" + this.value);
      }
   }
}

