package iData.iItem
{
   public class StatList
   {
      
      public static const list:Vector.<Stat> = new <Stat>[new Stat(Stat.hp,5),new Stat(Stat.mp,5),new Stat(Stat.attackMin,2),new Stat(Stat.attackMax,2),new Stat(Stat.str,3),new Stat(Stat.dex,3),new Stat(Stat.intelligence,3),new Stat(Stat.will,3),new Stat(Stat.luck,1),new Stat(Stat.defence,1),new Stat(Stat.protection,1),new Stat(Stat.crit,1),new Stat(Stat.crit_mul,1),new Stat(Stat.magicDamage,1),new Stat(Stat.protectionIgnore,1),new Stat(Stat.spellChance,0.5),new Stat(Stat.balance,1)];
      
      public function StatList()
      {
         super();
      }
   }
}

