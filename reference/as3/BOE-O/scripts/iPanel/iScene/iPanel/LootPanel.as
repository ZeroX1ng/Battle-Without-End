package iPanel.iScene.iPanel
{
   import iData.iItem.Equipment;
   import iPanel.iCell.BasicCell;
   import iPanel.iCell.StringCell;
   
   public class LootPanel extends BasicCell
   {
      
      private const beginX:int = 10;
      
      private const beginY:int = 30;
      
      private const gap:int = 18;
      
      private const fontSize:int = 20;
      
      private const gapX:int = 100;
      
      private var money_c:StringCell;
      
      private var exp_c:StringCell;
      
      private var basic_c:StringCell;
      
      private var magic_c:StringCell;
      
      private var rare_c:StringCell;
      
      private var perfect_c:StringCell;
      
      private var epic_c:StringCell;
      
      private var legendary_c:StringCell;
      
      public var money:int;
      
      public var exp:int;
      
      public var basic:int;
      
      public var magic:int;
      
      public var rare:int;
      
      public var perfect:int;
      
      public var epic:int;
      
      public var legendary:int;
      
      public function LootPanel()
      {
         super(170,185);
         var _loc1_:StringCell = new StringCell("当前地图掉落",150,24);
         this.addChild(_loc1_);
         _loc1_.x = 5;
         _loc1_.y = 5;
         _loc1_ = new StringCell("<font color=\'#FFA640\'>$</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY;
         _loc1_ = new StringCell("<font color=\'#4a60d7\'>EXP",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap;
         _loc1_ = new StringCell("普通",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 2;
         _loc1_ = new StringCell("<font color=\'" + Equipment.GREEN + "\'>精品</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 3;
         _loc1_ = new StringCell("<font color=\'" + Equipment.BLUE + "\'>稀有</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 4;
         _loc1_ = new StringCell("<font color=\'" + Equipment.YELLOW + "\'>完美</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 5;
         _loc1_ = new StringCell("<font color=\'" + Equipment.ORANGE + "\'>史诗</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 6;
         _loc1_ = new StringCell("<font color=\'" + Equipment.PURPLE + "\'>传奇</font>",100,this.fontSize);
         this.addChild(_loc1_);
         _loc1_.x = this.beginX;
         _loc1_.y = this.beginY + this.gap * 7;
         this.money_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.money_c);
         this.money_c.x = this.beginX + this.gapX;
         this.money_c.y = this.beginY;
         this.exp_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.exp_c);
         this.exp_c.x = this.beginX + this.gapX;
         this.exp_c.y = this.beginY + this.gap * 1;
         this.basic_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.basic_c);
         this.basic_c.x = this.beginX + this.gapX;
         this.basic_c.y = this.beginY + this.gap * 2;
         this.magic_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.magic_c);
         this.magic_c.x = this.beginX + this.gapX;
         this.magic_c.y = this.beginY + this.gap * 3;
         this.rare_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.rare_c);
         this.rare_c.x = this.beginX + this.gapX;
         this.rare_c.y = this.beginY + this.gap * 4;
         this.perfect_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.perfect_c);
         this.perfect_c.x = this.beginX + this.gapX;
         this.perfect_c.y = this.beginY + this.gap * 5;
         this.epic_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.epic_c);
         this.epic_c.x = this.beginX + this.gapX;
         this.epic_c.y = this.beginY + this.gap * 6;
         this.legendary_c = new StringCell("0",65,this.fontSize);
         this.addChild(this.legendary_c);
         this.legendary_c.x = this.beginX + this.gapX;
         this.legendary_c.y = this.beginY + this.gap * 7;
      }
      
      public function reset() : *
      {
         this.money = 0;
         this.exp = 0;
         this.basic = 0;
         this.magic = 0;
         this.rare = 0;
         this.perfect = 0;
         this.epic = 0;
         this.legendary = 0;
      }
      
      public function update() : *
      {
         this.money_c.setText(this.money + "");
         this.exp_c.setText(this.exp + "");
         this.basic_c.setText(this.basic + "");
         this.magic_c.setText(this.magic + "");
         this.rare_c.setText(this.rare + "");
         this.perfect_c.setText(this.perfect + "");
         this.epic_c.setText(this.epic + "");
         this.legendary_c.setText(this.legendary + "");
      }
   }
}

