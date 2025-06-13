import { IMenuData } from "@/types/menu-d-t";

const menu_data:IMenuData[] = [
  {
    id:1,
    name:'Home',
    link:'/',
    has_dropdown:false
  },
  {
    id:2,
    name:'Shop',
    link:'/shop',
    has_dropdown:true,
    shop_menus:[
      {
        id:1,
        title:'Spice Categories',
        menus:[
          {title:'Whole Spices',link:'/shop?category=whole'},
          {title:'Ground Spices',link:'/shop?category=ground'},
          {title:'Spice Blends',link:'/shop?category=blends'},
          {title:'Seasoning Mixes',link:'/shop?category=seasoning'},
        ]
      },
      {
        id:2,
        title:'Special Offers',
        menus:[
          {title:'New Arrivals',link:'/shop?filter=new'},
          {title:'Best Sellers',link:'/shop?filter=best'},
          {title:'Special Deals',link:'/shop?filter=deals'},
        ]
      }
    ]
  },
  {
    id:3,
    name:'About Us',
    link:'/about',
  },
  {
    id:4,
    name:'Contact Us',
    link:'/contact',
  },
  {
    id:5,
    name:'Cart',
    link:'/cart',
  },
  {
    id:6,
    name:'Wishlist',
    link:'/wishlist',
  }
]

export default menu_data;

// mobile menus 
export const mobile_menus = [
  {
    id:1,
    name:'Home',
    link:'/',
    has_dropdown:false
  },
  {
    id:2,
    name:'Shop',
    link:'/shop',
    has_dropdown:true,
    dropdown_menus:[
      {title:'Whole Spices',link:'/shop?category=whole'},
      {title:'Ground Spices',link:'/shop?category=ground'},
      {title:'Spice Blends',link:'/shop?category=blends'},
      {title:'Seasoning Mixes',link:'/shop?category=seasoning'},
      {title:'New Arrivals',link:'/shop?filter=new'},
      {title:'Best Sellers',link:'/shop?filter=best'},
      {title:'Special Deals',link:'/shop?filter=deals'},
    ]
  },
  {
    id:3,
    name:'About Us',
    link:'/about',
  },
  {
    id:4,
    name:'Contact Us',
    link:'/contact',
  },
  {
    id:5,
    name:'Cart',
    link:'/cart',
  },
  {
    id:6,
    name:'Wishlist',
    link:'/wishlist',
  }
]