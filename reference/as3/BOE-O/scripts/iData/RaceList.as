package iData
{
   public class RaceList
   {
      
      public static const HUMAN:Race = new Race("人类",new BasicStatus(16,25,10,10,14,10,10),new <BasicStatus>[new BasicStatus(2,4,1,2,4,2,2),new BasicStatus(2,4,1,2,4,2,2),new BasicStatus(3,3,1,2,4,3,1),new BasicStatus(3,3,1,2,4,3,1),new BasicStatus(2,3,1,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,2,2,2,3,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(1,2,1,1,2,1,0),new BasicStatus(1,1,1,1,1,1,0),new BasicStatus(1,1,0,1,1,1,0),new BasicStatus(0,0,0,0,0,0,0)]);
      
      public static const ELF:Race = new Race("精灵",new BasicStatus(18,22,10,14,10,10,10),new <BasicStatus>[new BasicStatus(3,3,2,4,2,1,2),new BasicStatus(3,3,2,4,2,1,2),new BasicStatus(3,3,1,4,2,2,1),new BasicStatus(3,3,1,4,2,2,1),new BasicStatus(2,3,1,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,3,2,3,3,2,0),new BasicStatus(2,2,2,3,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(1,2,1,1,2,1,0),new BasicStatus(1,1,1,1,1,1,0),new BasicStatus(1,1,0,1,1,1,0),new BasicStatus(0,0,0,0,0,0,0)]);
      
      public static const GIANT:Race = new Race("巨人",new BasicStatus(25,16,14,10,10,10,10),new <BasicStatus>[new BasicStatus(4,2,4,2,1,2,2),new BasicStatus(4,2,4,2,1,2,2),new BasicStatus(4,2,4,2,1,3,1),new BasicStatus(3,3,4,2,1,3,1),new BasicStatus(3,2,3,3,1,2,0),new BasicStatus(3,2,3,3,2,2,0),new BasicStatus(3,2,3,3,2,2,0),new BasicStatus(3,2,3,3,2,2,0),new BasicStatus(2,2,3,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,1,1,1,2,1,0),new BasicStatus(1,1,1,1,1,1,0),new BasicStatus(1,1,1,1,0,1,0),new BasicStatus(0,0,0,0,0,0,0)]);
      
      public static const UNDEATH:Race = new Race("不死",new BasicStatus(21,19,10,10,10,14,10),new <BasicStatus>[new BasicStatus(3,3,2,2,2,4,2),new BasicStatus(3,3,2,2,2,4,2),new BasicStatus(3,3,3,2,2,4,1),new BasicStatus(3,3,3,2,2,3,1),new BasicStatus(3,2,2,3,3,3,0),new BasicStatus(3,2,2,3,3,3,0),new BasicStatus(2,2,2,3,2,3,0),new BasicStatus(2,2,2,3,2,3,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(2,2,2,2,2,2,0),new BasicStatus(1,2,1,1,2,1,0),new BasicStatus(1,1,1,1,1,1,0),new BasicStatus(1,1,1,1,0,1,0),new BasicStatus(0,0,0,0,0,0,0)]);
      
      public static const DWARF:Race = new Race("矮人",new BasicStatus(18,18,10,10,10,10,14),new <BasicStatus>[new BasicStatus(2,2,1,2,2,2,4),new BasicStatus(2,2,2,1,2,2,4),new BasicStatus(2,2,2,2,1,2,3),new BasicStatus(2,2,2,2,2,1,3),new BasicStatus(2,2,2,2,2,2,3),new BasicStatus(3,3,2,2,2,2,2),new BasicStatus(2,3,2,2,2,2,2),new BasicStatus(3,2,2,2,2,2,2),new BasicStatus(2,2,2,2,2,2,2),new BasicStatus(2,2,2,2,2,2,1),new BasicStatus(2,2,2,2,2,2,1),new BasicStatus(2,2,2,2,2,2,1),new BasicStatus(1,2,1,1,2,1,1),new BasicStatus(1,1,1,1,1,1,1),new BasicStatus(1,1,0,1,1,1,1),new BasicStatus(0,0,0,0,0,0,0)]);
      
      public static const list:Vector.<Race> = new <Race>[RaceList.HUMAN,RaceList.ELF,RaceList.GIANT,RaceList.DWARF,RaceList.UNDEATH];
      
      public function RaceList()
      {
         super();
      }
   }
}

