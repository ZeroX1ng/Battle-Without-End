package iData.iPet
{
   public class PetDataList
   {
      
      public static var att_fox:PetData = new PetData("Red Fox","红狐狸",PetTypeList.attack,"fox");
      
      public static var def_fox:PetData = new PetData("Brown Fox","棕狐狸",PetTypeList.defence,"fox");
      
      public static var bal_fox:PetData = new PetData("Gray Fox","灰狐狸",PetTypeList.balance,"fox");
      
      public static var att_rat:PetData = new PetData("Town Rat","白鼠",PetTypeList.attack,"rat");
      
      public static var def_rat:PetData = new PetData("Black Rat","黑鼠",PetTypeList.defence,"rat");
      
      public static var mag_rat:PetData = new PetData("Rat Mage","魔鼠",PetTypeList.magic,"rat");
      
      public static var att_spider:PetData = new PetData("Red Spider","红蜘蛛",PetTypeList.attack,"spider");
      
      public static var def_spider:PetData = new PetData("Giant Spider","巨蜘蛛",PetTypeList.defence,"spider");
      
      public static var att_wolf:PetData = new PetData("Wild Wolf","野狼",PetTypeList.attack,"wolf");
      
      public static var mag_wolf:PetData = new PetData("Werewolf","狼人",PetTypeList.magic,"wolf");
      
      public static var att_bear:PetData = new PetData("Red Bear","红熊",PetTypeList.attack,"bear");
      
      public static var def_bear:PetData = new PetData("Brown Bear","棕熊",PetTypeList.defence,"bear");
      
      public static var bal_bear:PetData = new PetData("Gray Bear","灰熊",PetTypeList.balance,"bear");
      
      public static var att_goblin:PetData = new PetData("Goblin Warrior","哥布林战士",PetTypeList.attack,"goblin");
      
      public static var def_goblin:PetData = new PetData("Goblin Protector","哥布林卫士",PetTypeList.defence,"goblin");
      
      public static var bal_goblin:PetData = new PetData("Goblin Archer","哥布林弓手",PetTypeList.balance,"goblin");
      
      public static var mag_goblin:PetData = new PetData("Goblin Mage","哥布林法师",PetTypeList.magic,"goblin");
      
      public static var att_skeleton:PetData = new PetData("Skeleton Warrior","骷髅战士",PetTypeList.attack,"skeleton");
      
      public static var def_skeleton:PetData = new PetData("Skeleton Protector","骷髅卫士",PetTypeList.defence,"skeleton");
      
      public static var bal_skeleton:PetData = new PetData("Skeleton Archer","骷髅弓手",PetTypeList.balance,"skeleton");
      
      public static var mag_skeleton:PetData = new PetData("Skeleton Mage","骷髅法师",PetTypeList.magic,"skeleton");
      
      public static var att_ghost:PetData = new PetData("Fire Sprite","火焰幽灵",PetTypeList.attack,"ghost");
      
      public static var def_ghost:PetData = new PetData("Stone Sprite","岩石幽灵",PetTypeList.defence,"ghost");
      
      public static var bal_ghost:PetData = new PetData("Wind Sprite","风幽灵",PetTypeList.balance,"ghost");
      
      public static var mag_ghost:PetData = new PetData("Lightning Sprite","雷幽灵",PetTypeList.magic,"ghost");
      
      public static var att_zombie:PetData = new PetData("Zombie Warrior","僵尸武士",PetTypeList.attack,"zombie");
      
      public static var def_zombie:PetData = new PetData("Zombie Protector","僵尸卫士",PetTypeList.defence,"zombie");
      
      public static var bal_zombie:PetData = new PetData("Zombie Archer","僵尸弓手",PetTypeList.balance,"zombie");
      
      public static var mag_zombie:PetData = new PetData("Zombie Mage","僵尸法师",PetTypeList.magic,"zombie");
      
      public static var att_ruin:PetData = new PetData("Warrior of Ruins","毁灭战士",PetTypeList.attack,"attack");
      
      public static var def_ruin:PetData = new PetData("Protector of Ruins","毁灭卫士",PetTypeList.defence,"defence");
      
      public static var bal_ruin:PetData = new PetData("Archer of Ruins","毁灭弓手",PetTypeList.balance,"balance");
      
      public static var mag_ruin:PetData = new PetData("Mage of Ruins","毁灭法师",PetTypeList.magic,"magic");
      
      public static var def_unicorn:PetData = new PetData("Holy Unicorn","神圣独角兽",PetTypeList.defence,"unicorn");
      
      public static var bal_unicorn:PetData = new PetData("Prairie Unicorn","自然独角兽",PetTypeList.balance,"unicorn");
      
      public static var att_dragon:PetData = new PetData("Dark Dragon","暗黑龙",PetTypeList.attack,"dragon");
      
      public static var mag_dragon:PetData = new PetData("Shining Dragon","光明龙",PetTypeList.magic,"dragon");
      
      public static var list:Vector.<PetData> = new <PetData>[att_bear,att_dragon,att_fox,att_ghost,att_goblin,att_rat,att_ruin,att_skeleton,att_spider,att_wolf,att_zombie,def_bear,def_fox,def_ghost,def_goblin,def_rat,def_ruin,def_skeleton,def_spider,def_unicorn,def_zombie,bal_bear,bal_fox,bal_ghost,bal_goblin,bal_ruin,bal_skeleton,bal_unicorn,bal_zombie,mag_dragon,mag_ghost,mag_ghost,mag_goblin,mag_rat,mag_ruin,mag_skeleton,mag_wolf,mag_zombie];
      
      public function PetDataList()
      {
         super();
      }
   }
}

