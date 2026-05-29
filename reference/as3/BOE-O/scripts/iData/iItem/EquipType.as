package iData.iItem
{
   public class EquipType
   {
      
      public static const HEAVY:String = "heavy";
      
      public static const MEDIUM:String = "medium";
      
      public static const LIGHT:String = "light";
      
      public static const ACCESORY:String = "accesory";
      
      public static const HEAVY_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.defence,2),new Stat(Stat.protection,1)];
      
      public static const MEDIUM_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.hp,5),new Stat(Stat.protection,1)];
      
      public static const LIGHT_BASE:Vector.<Stat> = new <Stat>[new Stat(Stat.hp,5),new Stat(Stat.defence,2)];
      
      public static const ACCESORY_BASE:Vector.<Stat> = new Vector.<Stat>();
      
      public function EquipType()
      {
         super();
      }
   }
}

