package iData.iPlayer
{
   import iData.iItem.Equipment;
   import iData.iMonster.StatMul;
   import iPanel.iScene.MainScene;
   import tool.MyMath;
   
   public class Title
   {
      
      public var name:String;
      
      public var realName:String;
      
      public var statMulList:Vector.<StatMul>;
      
      public var maxFix:int;
      
      public var countFix:int;
      
      public var max:int;
      
      public var count:int;
      
      public var description:String;
      
      public var behaveFunction:Function;
      
      public var isGot:Boolean = false;
      
      public function Title(param1:String, param2:String, param3:String, param4:Vector.<StatMul>, param5:int = 0, param6:int = 0, param7:Function = null)
      {
         super();
         this.name = param1;
         this.realName = param2;
         this.description = param3;
         this.statMulList = param4;
         this.maxFix = param5;
         this.countFix = param6;
         this.behaveFunction = param7;
      }
      
      public function setGot() : *
      {
         if(!this.isGot)
         {
            this.isGot = true;
            if(MainScene.allInfoPanel)
            {
               MainScene.allInfoPanel.addText("<font color=\'" + Equipment.ORANGE + "\'>You get Title &lt;" + this.name + "&gt; </font>");
            }
            if(Boolean(this.behaveFunction))
            {
               this.behaveFunction();
            }
            if(MainScene.otherPanel)
            {
               if(MainScene.otherPanel.titleWindow)
               {
                  MainScene.otherPanel.titleWindow.update();
               }
            }
         }
      }
      
      public function updateInfo(param1:int = 0, param2:int = 0) : *
      {
         if(param1 > this.max)
         {
            this.max = param1;
         }
         if(param2 < 0)
         {
            this.count = 0;
         }
         else
         {
            this.count += param2;
         }
         if(this.isGot)
         {
            return;
         }
         if(this.count >= this.countFix && this.max >= this.maxFix)
         {
            this.setGot();
         }
      }
      
      public function getDescription() : String
      {
         var _loc1_:String = "";
         _loc1_ += "<p align=\'center\'>" + this.description + "</p>";
         _loc1_ += "--------------<br/>";
         if(this.maxFix != 0)
         {
            _loc1_ += "记录:" + this.max + "<br/>";
            _loc1_ += "--------------<br/>";
         }
         if(this.countFix != 0)
         {
            _loc1_ += "记录:" + this.count + "<br/>";
            _loc1_ += "--------------<br/>";
         }
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
         return _loc1_;
      }
      
      public function save() : String
      {
         var _loc1_:String = "";
         _loc1_ += this.max + "#" + this.count + "#";
         if(this.isGot)
         {
            _loc1_ += "1";
         }
         else
         {
            _loc1_ += "0";
         }
         return _loc1_;
      }
      
      public function load(param1:String) : *
      {
         var _loc2_:Array = param1.split("#");
         this.max = _loc2_[0];
         this.count = _loc2_[1];
         if(_loc2_[2] == 0)
         {
            this.isGot = false;
         }
         else
         {
            this.isGot = true;
         }
      }
   }
}

