import bottle from "../assets/images/product-bottle.jpeg";
import fieldBottle from "../assets/images/field-bottle.jpeg";
import curd1 from "../assets/images/Curd1L.png";
import curd2 from "../assets/images/Curd2L.png";
import curd from "../assets/images/Curd500ML.png";
import Gee from "../assets/images/Gee.png";
import Gee1 from "../assets/images/Gee-1.png";
import Gee2 from "../assets/images/Gee-2.png";
import Milk2 from "../assets/images/Milk2L.png"
import Milk1 from "../assets/images/Milk1L.png"
export const products = [
   {
    id: "raw-cow-2l",
    name: "Fresh Cow Milk 2 Liter",
    unit: "2 Litres",
    price: 120,
    image: Milk2,
    badge: "Family Pack",
    description: "A practical family-size quantity for regular delivery."
  },
  {
    id: "raw-cow-1l",
    name: "Fresh Cow Milk 1 Liter",
    unit: "1 Litre",
    price: 60,
    image: Milk1,
    badge: "Best Seller",
    description: "Fresh milk for your family's everyday routine."
  },
  {
    id: "raw-cow-500",
    name: "Fresh Cow Milk 500 ml",
    unit: "500 ml",
    price: 30,
    image:bottle,
    badge: "Popular",
    description: "A convenient half-litre option for smaller households."
  },
    {
    id: "fresh-curd-02",
    name: "Fresh Curd 2 Liter",
    unit: "2 Litres",
    price: 140,
    image: curd2,
    badge: "Family Pack",
    description: "A practical family-size quantity for regular delivery."
  },
      {
    id: "fresh-curd-01",
    name: "Fresh Curd 1 Liter",
    unit: "1 Litres",
    price: 70,
    image: curd1,
    badge: "Best Seller",
    description: "Fresh milk for your family's everyday routine."
  },
    {
    id: "fresh-curd-03",
    name: "Fresh Curd 500 ml",
    unit: "500 ml",
    price: 35,
    image: curd,
    badge: "Popular",
    description: "A convenient half-litre option for smaller households."
  },
    {
    id: "fresh-curd-04",
    name: "Fresh Gee 2 Liter",
    unit: "2 Liters",
    price: 999,
    image: Gee2,
    badge: "Family Pack",
    description: "A practical family-size quantity for regular delivery."
  },
    {
    id: "fresh-curd-05",
    name: "Fresh Gee 1 Liter",
    unit: "1 Litres",
    price: 499,
    image: Gee1,
    badge: "Best Seller",
    description: "A practical family-size quantity for regular delivery."
  },
    {
    id: "fresh-curd-06",
    name: "Fresh Gee 500ml",
    unit: "500 ml",
    price: 249,
    image: Gee,
    badge: "Populer",
    description: "A practical family-size quantity for regular delivery."
  }
  
  
];