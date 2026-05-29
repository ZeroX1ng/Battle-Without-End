package iData.iItem
{
   public class WeaponType
   {
      
      public static const SWORD:String = "sword";
      
      public static const AXE:String = "axe";
      
      public static const BOW:String = "bow";
      
      public static const CROSSBOW:String = "crossbow";
      
      public static const STAFF:String = "staff";
      
      public static const SCEPTRE:String = "sceptre";
      
      public static const DAGGER:String = "dagger";
      
      public static const SHIELD:String = "shield";
      
      public static const TOME:String = "tome";
      
      public static const SWORD_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.ATTACK,2.5),new Stat(Stat.crit,2)];
      
      public static const AXE_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.ATTACK,4),new Stat(Stat.hp,5)];
      
      public static const BOW_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.ATTACK,3),new Stat(Stat.protectionIgnore,1)];
      
      public static const CROSSBOW_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.ATTACK,4),new Stat(Stat.crit_mul,3)];
      
      public static const STAFF_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.mp,5),new Stat(Stat.magicDamage,1)];
      
      public static const SCEPTRE_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.ATTACK,2),new Stat(Stat.mp,5)];
      
      public static const DAGGER_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.crit_mul,3)];
      
      public static const SHIELD_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.defence,3)];
      
      public static const TOME_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.spellChance,0.3)];
      
      public function WeaponType()
      {
         super();
      }
   }
}

