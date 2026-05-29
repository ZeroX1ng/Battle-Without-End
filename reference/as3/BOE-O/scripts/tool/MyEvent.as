package tool
{
   import flash.events.Event;
   
   public class MyEvent extends Event
   {
      
      public static const Change:String = "change";
      
      public static const Update:String = "myupdate";
      
      public static const MyScroll:String = "myScroll";
      
      public function MyEvent(param1:String)
      {
         super(param1);
      }
   }
}

