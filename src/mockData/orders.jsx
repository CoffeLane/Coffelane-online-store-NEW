import image1 from '../assets/images/coffe/image_1.png';
import image2 from '../assets/images/coffe/image_2.png';
import image3 from '../assets/images/coffe/image_3.png';
import image4 from '../assets/images/coffe/image_8.png';


export const orders = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 123456789,
      order_notes: "",
      status: "Delivered",
      date: "02/11/2024",
      positions: [
        {
          id: 1,
          name: "Instant coffee Jacobs Barista Editions Americano",
          description: "Ground coffee Jacobs Barista Editions",
          quantity: 2,
          price: 20,
          photos_url: [{ id: 1, url: image1 }],
        },
        {
          id: 2,
          name: "Blasercafe Sera",
          description: "Coffee in grains Blasercafe Sera",
          quantity: 1,
          price: 20,
          photos_url: [{ id: 1, url: image4 }],
        },
        {
          id: 3,
          name: "Lavazza Qualita Oro",
          description: "Coffee in grains Lavazza Qualita Oro",
          quantity: 1,
          price: 60,
          photos_url: [{ id: 1, url: image2 }],
        },
      ],
      total: 120,
    },
    {
      id: 987654321,
      order_notes: "",
      status: "Delivering",
      date: "25/11/2024",
      positions: [
        {
          id: 4,
          name: "Instant coffee Jacobs Barista Editions Americano",
          description: "Ground coffee Jacobs Barista Editions",
          quantity: 2,
          price: 5,
          photos_url: [{ id: 1, url: image2 }],
        },
        {
          id: 5,
          name: "Blasercafe Sera",
          description: "Coffee in grains Blasercafe Sera",
          quantity: 1,
          price: 20,
          photos_url: [{ id: 1, url: image4 }],
        },
        {
          id: 6,
          name: "Lavazza Qualita Oro",
          description: "Coffee in grains Lavazza Qualita Oro",
          quantity: 1,
          price: 60,
          photos_url: [{ id: 1, url: image2 }],
        },
      ],
      total: 90,
    },
    {
      id:123456793 ,
      order_notes: "",
      status: "Cancelled",
      date: "23/02/2024",
      positions: [
        {
          id: 4,
          name: "Instant coffee Jacobs Barista Editions Americano",
          description: "Ground coffee Jacobs Barista Editions",
          quantity: 2,
          price: 40,
          photos_url: [{ id: 1, url: image2 }],
        },
        
      ],
      total: 80,
    },
  ],
};

