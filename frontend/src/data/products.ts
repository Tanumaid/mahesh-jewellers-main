import ringImg from "../assets/Ring.jfif";
import necklaceImg from "../assets/Necklace.jpg";
import earringsImg from "../assets/EarRings.jfif";

export const products = [
  {
    id: 1,
    name: "Gold Ring",
    price: "₹25,000",
    weight: "5 grams",
    purity: "22K",
    makingCharges: "₹1500",
    gst: "3%",
    image: ringImg,
  },
  {
    id: 2,
    name: "Diamond Necklace",
    price: "₹85,000",
    weight: "12 grams",
    purity: "22K",
    makingCharges: "₹3500",
    gst: "3%",
    image: necklaceImg,
  },
  {
    id: 3,
    name: "Earrings",
    price: "₹30,000",
    weight: "6 grams",
    purity: "22K",
    makingCharges: "₹1800",
    gst: "3%",
    image: earringsImg,
  },
];
