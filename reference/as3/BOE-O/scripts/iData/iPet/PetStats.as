package iData.iPet
{
   import tool.MyMath;
   
   public class PetStats
   {
      
      public static const list:Array = ["hp","mp","attmin","attmax","def","pro","balance","cri","criMul","magAtt"];
      
      private var _hp:Number;
      
      private var _mp:Number;
      
      private var _attmin:Number;
      
      private var _attmax:Number;
      
      private var _def:Number;
      
      private var _pro:Number;
      
      private var _balance:Number;
      
      private var _cri:Number;
      
      private var _criMul:Number;
      
      private var _magAtt:Number;
      
      public function PetStats(param1:Number, param2:Number, param3:Number, param4:Number, param5:Number, param6:Number, param7:Number, param8:Number, param9:Number, param10:Number)
      {
         super();
         this.hp = param1;
         this.mp = param2;
         this.attmin = param3;
         this.attmax = param4;
         this.def = param5;
         this.pro = param6;
         this.balance = param7;
         this.cri = param8;
         this.criMul = param9;
         this.magAtt = param10;
      }
      
      public static function generatePetStats(param1:PetStats, param2:PetStats, param3:Number) : PetStats
      {
         var _loc4_:PetStats = new PetStats(0,0,0,0,0,0,0,0,0,0);
         var _loc5_:int = 0;
         while(_loc5_ < list.length)
         {
            _loc4_[list[_loc5_]] = formula(param1[list[_loc5_]],param2[list[_loc5_]],param3);
            _loc5_++;
         }
         return _loc4_;
      }
      
      private static function formula(param1:Number, param2:Number, param3:Number) : Number
      {
         return param1 + param2 * param3 * Math.random();
      }
      
      public static function load(param1:String) : PetStats
      {
         var _loc2_:Array = param1.split("%");
         var _loc3_:PetStats = new PetStats(0,0,0,0,0,0,0,0,0,0);
         var _loc4_:int = 0;
         while(_loc4_ < list.length)
         {
            _loc3_[list[_loc4_]] = _loc2_[_loc4_];
            _loc4_++;
         }
         return _loc3_;
      }
      
      public function get hp() : Number
      {
         return MyMath.decryptNum(this._hp);
      }
      
      public function set hp(param1:Number) : *
      {
         this._hp = MyMath.encryptNum(param1);
      }
      
      public function get mp() : Number
      {
         return MyMath.decryptNum(this._mp);
      }
      
      public function set mp(param1:Number) : *
      {
         this._mp = MyMath.encryptNum(param1);
      }
      
      public function get attmin() : Number
      {
         return MyMath.decryptNum(this._attmin);
      }
      
      public function set attmin(param1:Number) : *
      {
         this._attmin = MyMath.encryptNum(param1);
      }
      
      public function get attmax() : Number
      {
         return MyMath.decryptNum(this._attmax);
      }
      
      public function set attmax(param1:Number) : *
      {
         this._attmax = MyMath.encryptNum(param1);
      }
      
      public function get def() : Number
      {
         return MyMath.decryptNum(this._def);
      }
      
      public function set def(param1:Number) : *
      {
         this._def = MyMath.encryptNum(param1);
      }
      
      public function get pro() : Number
      {
         return MyMath.decryptNum(this._pro);
      }
      
      public function set pro(param1:Number) : *
      {
         this._pro = MyMath.encryptNum(param1);
      }
      
      public function get balance() : Number
      {
         return MyMath.decryptNum(this._balance);
      }
      
      public function set balance(param1:Number) : *
      {
         this._balance = MyMath.encryptNum(param1);
      }
      
      public function get cri() : Number
      {
         return MyMath.decryptNum(this._cri);
      }
      
      public function set cri(param1:Number) : *
      {
         this._cri = MyMath.encryptNum(param1);
      }
      
      public function get criMul() : Number
      {
         return MyMath.decryptNum(this._criMul);
      }
      
      public function set criMul(param1:Number) : *
      {
         this._criMul = MyMath.encryptNum(param1);
      }
      
      public function get magAtt() : Number
      {
         return MyMath.decryptNum(this._magAtt);
      }
      
      public function set magAtt(param1:Number) : *
      {
         this._magAtt = MyMath.encryptNum(param1);
      }
      
      public function save() : String
      {
         var _loc1_:String = "";
         var _loc2_:int = 0;
         while(_loc2_ < list.length)
         {
            _loc1_ += this[list[_loc2_]] + "%";
            _loc2_++;
         }
         return _loc1_;
      }
   }
}

