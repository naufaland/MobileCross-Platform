// Define TypeScript interface for user data
export interface User {
  name: string;
  email: string;
  photo: { uri: string };
  phone: string;
  favorite?: boolean;
}

// User data
export const userData: User[] = [
  {
    name: "AMBALATHON",
    email: "ambalabu_anthon@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/11.jpg" },
    phone: "+62 812-3456-7890",
    favorite: true,
  },
  {
    name: "SONIC",
    email: "sonicBogor@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/12.jpg" },
    phone: "+62 813-4567-8901",
    favorite: false,
  },
  {
    name: "Tristan MartabakMAN",
    email: "martabak_wisman@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/13.jpg" },
    phone: "+62 814-5678-9012",
    favorite: true,
  },
  {
    name: "ReinHARD",
    email: "reinjv@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/14.jpg" },
    phone: "+62 815-6789-0123",
    favorite: false,
  },
  {
    name: "Pak Vincent",
    email: "sayaAda2@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/15.jpg" },
    phone: "+62 816-7890-1234",
    favorite: true,
  },
  {
    name: "Bola Reinhard",
    email: "bola_reinhard@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/16.jpg" },
    phone: "+62 817-8901-2345",
    favorite: false,
  },
  {
    name: "Adam Warlock",
    email: "adam_warlock@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/17.jpg" },
    phone: "+62 818-9012-3456",
    favorite: false,
  },
  {
    name: "Efri",
    email: "efri@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/women/11.jpg" },
    phone: "+62 819-0123-4567",
    favorite: true,
  },
  {
    name: "IShowSpeed",
    email: "ishowspeed@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/18.jpg" },
    phone: "+62 820-1234-5678",
    favorite: false,
  },
  {
    name: "Roblox",
    email: "roblox@mail.com",
    photo: { uri: "https://randomuser.me/api/portraits/men/19.jpg" },
    phone: "+62 821-2345-6789",
    favorite: true,
  },
];
