package iData.iItem
{
   import flash.utils.getDefinitionByName;
   import iGlobal.Player;
   import tool.MyMath;
   
   public class Equipment
   {
      
      public static const HEAD:String = "head";
      
      public static const BODY:String = "body";
      
      public static const FEET:String = "feet";
      
      public static const NECKLACE:String = "necklace";
      
      public static const RING:String = "ring";
      
      public static const GREEN:String = "#4BB814";
      
      public static const BLUE:String = "#4a60d7";
      
      public static const YELLOW:String = "#a6a500";
      
      public static const ORANGE:String = "#ff7100";
      
      public static const PURPLE:String = "#9840be";
      
      public static const GREEN_H:int = 4962324;
      
      public static const BLUE_H:int = 4874455;
      
      public static const YELLOW_H:int = 10921216;
      
      public static const ORANGE_H:int = 16740608;
      
      public static const GRAY_H:int = 7631988;
      
      public static const PURPLE_H:int = 9978046;
      
      public var sortWeight:int;
      
      public var position:String;
      
      public var type:String;
      
      public var name:String;
      
      public var realName:String;
      
      public var level:int = 0;
      
      public var quality:int;
      
      public var basicStat:Vector.<Stat>;
      
      public var qualityStat:Vector.<Stat>;
      
      public var levelStat:Vector.<Stat>;
      
      private var ratio:Number;
      
      private var isBoss:Boolean = false;
      
      public function Equipment(param1:EquipmentData, param2:Number, param3:Boolean = false)
      {
         super();
         this.ratio = (param2 * 100 >> 0) / 100;
         if(this.ratio > 65)
         {
            this.ratio = 65;
         }
         this.level = 0;
         this.levelStat = new Vector.<Stat>();
         this.isBoss = param3;
         this.setData(param1);
         this.generateBasicStat(param1.stat,this.ratio);
         this.generateQuality(this.ratio);
      }
      
      public static function load(param1:String) : Equipment
      {
         var _loc3_:Equipment = null;
         var _loc4_:int = 0;
         var _loc6_:Array = null;
         var _loc2_:Array = param1.split("#");
         _loc4_ = 0;
         while(_loc4_ < EquipmentList.list.length)
         {
            if(EquipmentList.list[_loc4_].name == _loc2_[0])
            {
               if(EquipmentList.list[_loc4_] is WeaponData)
               {
                  _loc3_ = new Weapon(EquipmentList.list[_loc4_] as WeaponData,_loc2_[2]);
               }
               else
               {
                  _loc3_ = new Equipment(EquipmentList.list[_loc4_],_loc2_[2]);
               }
               break;
            }
            _loc4_++;
         }
         _loc3_.quality = _loc2_[3];
         _loc3_.basicStat = new Vector.<Stat>();
         var _loc5_:Array = (_loc2_[4] as String).split("%");
         _loc4_ = 0;
         while(_loc4_ < _loc5_.length)
         {
            if(_loc5_[_loc4_] != "")
            {
               _loc3_.basicStat.push(Stat.load(_loc5_[_loc4_]));
            }
            _loc4_++;
         }
         _loc3_.qualityStat = new Vector.<Stat>();
         if(_loc3_.quality > 0)
         {
            _loc6_ = (_loc2_[5] as String).split("%");
            _loc4_ = 0;
            while(_loc4_ < _loc6_.length)
            {
               if(_loc6_[_loc4_] != "")
               {
                  _loc3_.qualityStat.push(Stat.load(_loc6_[_loc4_]));
               }
               _loc4_++;
            }
         }
         _loc3_.setLevel(_loc2_[1]);
         return _loc3_;
      }
      
      protected function setData(param1:EquipmentData) : *
      {
         this.position = param1.position;
         this.type = param1.type;
         this.name = param1.name;
         this.realName = param1.realName;
         this.sortWeight = param1.sortWeight;
      }
      
      private function generateBasicStat(param1:Vector.<RangeStat>, param2:Number) : *
      {
         this.basicStat = new Vector.<Stat>();
         var _loc3_:int = int(param1.length);
         var _loc4_:int = 0;
         while(_loc4_ < _loc3_)
         {
            this.basicStat.push(Stat.generate(param1[_loc4_],param2));
            _loc4_++;
         }
         if(this.basicStat.length > 0)
         {
            if(this.basicStat[0].name == Stat.attackMin)
            {
               if(this.basicStat[0].value > this.basicStat[1].value)
               {
                  this.basicStat[0] = new Stat(Stat.attackMin,this.basicStat[1].value);
               }
            }
         }
      }
      
      private function generateQuality(param1:Number) : *
      {
         var _loc2_:int = 10 + param1 * 10;
         if(Player.basicStatus)
         {
            _loc2_ -= Player.combatPower / 30;
         }
         if(_loc2_ > 70)
         {
            _loc2_ = 70;
         }
         if(_loc2_ < 20)
         {
            _loc2_ = 20;
         }
         this.quality = MyMath.balanceRandom(_loc2_) * 5.1;
         if(this.isBoss)
         {
            this.quality = MyMath.balanceRandom(80) * 5.5;
         }
         this.generateQualityStat(param1);
      }
      
      private function generateQualityStat(param1:Number) : *
      {
         var _loc3_:int = 0;
         var _loc4_:Stat = null;
         var _loc5_:int = 0;
         var _loc6_:Stat = null;
         this.qualityStat = new Vector.<Stat>();
         var _loc2_:int = 0;
         while(_loc2_ < this.quality)
         {
            _loc3_ = (StatList.list.length - 1) * Math.random();
            if(this.type == EquipType.ACCESORY)
            {
               _loc3_ = (StatList.list.length - 2) * Math.random();
            }
            if(this is Weapon)
            {
               _loc3_ = StatList.list.length * Math.random();
            }
            _loc4_ = StatList.list[_loc3_];
            _loc5_ = _loc4_.value * Math.random() * Math.random() * param1;
            if(this.quality == 5)
            {
               _loc5_ = _loc4_.value * (Math.random() * Math.random() * 0.85 + 0.15) * param1;
            }
            _loc5_++;
            _loc6_ = new Stat(_loc4_.name,_loc5_);
            this.qualityStat.push(_loc6_);
            _loc2_++;
         }
      }
      
      public function setLevel(param1:int) : void
      {
         this.level = param1;
         if(param1 < 0)
         {
            this.level = 0;
            return;
         }
         if(param1 > 15)
         {
            this.level = 15;
         }
         this.generateLevelStat();
      }
      
      public function levelup() : void
      {
         ++this.level;
         this.generateLevelStat();
      }
      
      public function canLevelup() : Boolean
      {
         if(Player.gold > this.getMoney() && this.level < 15)
         {
            return true;
         }
         return false;
      }
      
      private function generateLevelStat() : void
      {
         var _loc1_:Vector.<Stat> = null;
         var _loc2_:int = 0;
         this.levelStat = new Vector.<Stat>();
         if(this.level == 0)
         {
            return;
         }
         if(this.type != EquipType.ACCESORY)
         {
            if(this is Weapon)
            {
               _loc1_ = WeaponType[this.type.toUpperCase() + "_BASE"];
            }
            else
            {
               _loc1_ = EquipType[this.type.toUpperCase() + "_BASE"];
            }
            _loc2_ = 0;
            while(_loc2_ < _loc1_.length)
            {
               if(this is Weapon)
               {
                  this.levelStat.push(new Stat(_loc1_[_loc2_].name,_loc1_[_loc2_].value * Math.pow(1.5,this.level - 1) * (1 + 0.2 * this.quality)));
               }
               else
               {
                  this.levelStat.push(new Stat(_loc1_[_loc2_].name,_loc1_[_loc2_].value * Math.pow(1.3,this.level - 1) * (1 + 0.2 * this.quality)));
               }
               _loc2_++;
            }
         }
         else
         {
            _loc2_ = 0;
            while(_loc2_ < this.qualityStat.length)
            {
               this.levelStat.push(new Stat(this.qualityStat[_loc2_].name,this.qualityStat[_loc2_].value * Math.pow(1.2,this.level - 1) * (1 + 0.2 * this.quality) * 0.4));
               _loc2_++;
            }
         }
      }
      
      private function getPostion() : String
      {
         switch(this.position)
         {
            case HEAD:
               return "头部";
            case BODY:
               return "身体";
            case FEET:
               return "脚部";
            case NECKLACE:
               return "项链";
            case RING:
               return "戒指";
            case Weapon.OFFHAND:
               return "副手";
            case Weapon.ONEHAND:
               return "单手";
            case Weapon.TWOHAND:
               return "双手";
            default:
               return this.position;
         }
      }
      
      private function getType() : String
      {
         switch(this.type)
         {
            case EquipType.ACCESORY:
               return "饰品";
            case EquipType.HEAVY:
               return "重甲";
            case EquipType.MEDIUM:
               return "中甲";
            case EquipType.LIGHT:
               return "轻甲";
            case WeaponType.AXE:
               return "斧";
            case WeaponType.BOW:
               return "弓";
            case WeaponType.CROSSBOW:
               return "弩";
            case WeaponType.DAGGER:
               return "匕首";
            case WeaponType.SCEPTRE:
               return "权杖";
            case WeaponType.SHIELD:
               return "盾牌";
            case WeaponType.STAFF:
               return "法杖";
            case WeaponType.SWORD:
               return "剑";
            case WeaponType.TOME:
               return "书";
            default:
               return this.type;
         }
      }
      
      public function getDescription() : String
      {
         var _loc2_:int = 0;
         var _loc1_:String = "<p align=\'center\'>" + this.getNameHTML();
         if(this.level)
         {
            _loc1_ += " +" + this.level;
            if(this.level == 15)
            {
               _loc1_ += "(MAX)";
            }
         }
         _loc1_ += "</p>";
         _loc1_ += "<p align=\'center\'><font size=\'16\'>" + MyMath.FirstLetterToUpper(this.getPostion()) + "," + MyMath.FirstLetterToUpper(this.getType());
         if(this is Weapon)
         {
            _loc1_ += "," + MyMath.FirstLetterToUpper((this as Weapon).getCategory());
         }
         _loc1_ += "</font></p>";
         _loc1_ += "<font size=\'20\'>";
         _loc2_ = 0;
         while(_loc2_ < this.basicStat.length)
         {
            if(this.basicStat[_loc2_].name == Stat.attackMin)
            {
               _loc1_ += "  攻击 " + (this.basicStat[_loc2_].value >> 0) + "~" + (this.basicStat[_loc2_ + 1].value >> 0) + "<br/>";
               _loc2_++;
            }
            else
            {
               _loc1_ += "  " + MyMath.FirstLetterToUpper(this.basicStat[_loc2_].statTranslate()) + " " + (this.basicStat[_loc2_].value >> 0) + "<br/>";
            }
            _loc2_++;
         }
         _loc1_ += "<font color=\'#00AF64\'>";
         _loc2_ = 0;
         while(_loc2_ < this.qualityStat.length)
         {
            _loc1_ += "  " + MyMath.FirstLetterToUpper(this.qualityStat[_loc2_].statTranslate()) + " +" + (this.qualityStat[_loc2_].value >> 0) + "<br/>";
            _loc2_++;
         }
         _loc1_ += "</font><font color=\'#4b5ed7\'>";
         _loc2_ = 0;
         while(_loc2_ < this.levelStat.length)
         {
            _loc1_ += "  " + MyMath.FirstLetterToUpper(this.levelStat[_loc2_].statTranslate()) + " +" + (this.levelStat[_loc2_].value >> 0) + "<br/>";
            _loc2_++;
         }
         _loc1_ += "</font></font>";
         return _loc1_ + ("<p align=\'right\'>$ " + this.getMoney() + "</p>");
      }
      
      public function getSellDesciption() : String
      {
         var _loc2_:int = 0;
         var _loc1_:String = "<p align=\'center\'>" + this.getNameHTML();
         if(this.level)
         {
            _loc1_ += " +" + this.level;
         }
         _loc1_ += "</p>";
         _loc1_ += "<p align=\'center\' ><font color=\'#ff4040\'>FOR SALE</font></p>";
         _loc1_ += "<p align=\'center\'><font size=\'16\'>" + MyMath.FirstLetterToUpper(this.getPostion()) + "," + MyMath.FirstLetterToUpper(this.getType());
         if(this is Weapon)
         {
            _loc1_ += "," + MyMath.FirstLetterToUpper((this as Weapon).getCategory());
         }
         _loc1_ += "</font></p>";
         _loc1_ += "<font size=\'20\'>";
         _loc2_ = 0;
         while(_loc2_ < this.basicStat.length)
         {
            if(this.basicStat[_loc2_].name == Stat.attackMin)
            {
               _loc1_ += "  攻击 " + (this.basicStat[_loc2_].value >> 0) + "~" + (this.basicStat[_loc2_ + 1].value >> 0) + "<br/>";
               _loc2_++;
            }
            else
            {
               _loc1_ += "  " + MyMath.FirstLetterToUpper(this.basicStat[_loc2_].statTranslate()) + " " + (this.basicStat[_loc2_].value >> 0) + "<br/>";
            }
            _loc2_++;
         }
         _loc1_ += "<font color=\'#00AF64\'>";
         _loc2_ = 0;
         while(_loc2_ < this.qualityStat.length)
         {
            _loc1_ += "  " + MyMath.FirstLetterToUpper(this.qualityStat[_loc2_].statTranslate()) + " +" + (this.qualityStat[_loc2_].value >> 0) + "<br/>";
            _loc2_++;
         }
         _loc1_ += "</font><font color=\'#4b5ed7\'>";
         _loc2_ = 0;
         while(_loc2_ < this.levelStat.length)
         {
            _loc1_ += "  " + MyMath.FirstLetterToUpper(this.levelStat[_loc2_].statTranslate()) + " +" + (this.levelStat[_loc2_].value >> 0) + "<br/>";
            _loc2_++;
         }
         _loc1_ += "</font></font>";
         return _loc1_ + ("<p align=\'right\'>$ " + this.getSellMoney() + "</p>");
      }
      
      public function getMoney() : int
      {
         return (this.ratio * 30 >> 0) * (this.level + 1);
      }
      
      public function getSellMoney() : int
      {
         return int(this.getMoney() * 10 * (1 + this.quality * this.quality));
      }
      
      public function getNameHTML() : String
      {
         var _loc1_:String = null;
         switch(this.quality)
         {
            case 1:
               _loc1_ = GREEN;
               break;
            case 2:
               _loc1_ = BLUE;
               break;
            case 3:
               _loc1_ = YELLOW;
               break;
            case 4:
               _loc1_ = ORANGE;
               break;
            case 5:
               _loc1_ = PURPLE;
         }
         return "<font color=\'" + _loc1_ + "\'>" + MyMath.FirstLetterToUpper(this.realName) + "</font>";
      }
      
      public function getColor() : String
      {
         var _loc1_:String = null;
         switch(this.quality)
         {
            case 1:
               _loc1_ = GREEN;
               break;
            case 2:
               _loc1_ = BLUE;
               break;
            case 3:
               _loc1_ = YELLOW;
               break;
            case 4:
               _loc1_ = ORANGE;
               break;
            case 5:
               _loc1_ = PURPLE;
         }
         return _loc1_;
      }
      
      public function getColorInHex() : int
      {
         var _loc1_:int = 0;
         switch(this.quality)
         {
            case 0:
               _loc1_ = GRAY_H;
               break;
            case 1:
               _loc1_ = GREEN_H;
               break;
            case 2:
               _loc1_ = BLUE_H;
               break;
            case 3:
               _loc1_ = YELLOW_H;
               break;
            case 4:
               _loc1_ = ORANGE_H;
               break;
            case 5:
               _loc1_ = PURPLE_H;
         }
         return _loc1_;
      }
      
      public function save() : String
      {
         var _loc2_:int = 0;
         var _loc1_:String = "";
         _loc1_ += this.name + "#" + this.level + "#" + this.ratio + "#" + this.quality;
         _loc1_ += "#";
         _loc2_ = 0;
         while(_loc2_ < this.basicStat.length)
         {
            _loc1_ += this.basicStat[_loc2_].save() + "%";
            _loc2_++;
         }
         if(this.quality > 0)
         {
            _loc1_ += "#";
            _loc2_ = 0;
            while(_loc2_ < this.qualityStat.length)
            {
               _loc1_ += this.qualityStat[_loc2_].save() + "%";
               _loc2_++;
            }
         }
         return _loc1_;
      }
   }
}

