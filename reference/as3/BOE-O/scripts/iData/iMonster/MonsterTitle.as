package iData.iMonster
{
   import iData.iItem.Equipment;
   import tool.MyMath;
   
   public class MonsterTitle
   {
      
      public var name:String;
      
      public var statMulList:Vector.<StatMul>;
      
      public var xpMul:Number;
      
      public var goldMul:Number;
      
      public var dropMul:Number;
      
      public function MonsterTitle(param1:String, param2:Vector.<StatMul>, param3:Number, param4:Number, param5:Number)
      {
         super();
         this.name = param1;
         this.statMulList = param2;
         this.xpMul = param3;
         this.goldMul = param4;
         this.dropMul = param5;
      }
      
      public function get description() : String
      {
         var _loc1_:String = "";
         var _loc2_:int = int(this.statMulList.length);
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_)
         {
            if(this.statMulList[_loc3_].add > 0)
            {
               _loc1_ += "<font size=\'20\' color=\'" + Equipment.GREEN + "\'>  " + MyMath.FirstLetterToUpper(this.statMulList[_loc3_].statTranslate()) + " +" + this.statMulList[_loc3_].add + "</font><br/>";
            }
            else if(this.statMulList[_loc3_].add < 0)
            {
               _loc1_ += "<font size=\'20\' color=\'#ff4040\'>  " + MyMath.FirstLetterToUpper(this.statMulList[_loc3_].statTranslate()) + " " + this.statMulList[_loc3_].add + "</font><br/>";
            }
            if(this.statMulList[_loc3_].mul > 1)
            {
               _loc1_ += "<font size=\'20\' color=\'" + Equipment.GREEN + "\'>  " + MyMath.FirstLetterToUpper(this.statMulList[_loc3_].statTranslate()) + " x" + this.statMulList[_loc3_].mul + "</font><br/>";
            }
            else if(this.statMulList[_loc3_].mul < 1)
            {
               _loc1_ += "<font size=\'20\' color=\'#ff4040\'>  " + MyMath.FirstLetterToUpper(this.statMulList[_loc3_].statTranslate()) + " x" + this.statMulList[_loc3_].mul + "</font><br/>";
            }
            _loc3_++;
         }
         if(_loc1_ == "")
         {
            _loc1_ = "???";
         }
         return _loc1_;
      }
   }
}

