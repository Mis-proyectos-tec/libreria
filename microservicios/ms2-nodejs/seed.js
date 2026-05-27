require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

const users = [
  {
    username: "victorm",
    name: "Victor",
    email: "victor@web.com",
    password: "",
    initials: "V",
    firebaseUid: "ax5AwJS7JYVty06xdftJezD83B42",
  },
  {
    username: "ian",
    name: "Ian",
    email: "ian@web.com",
    password: "",
    initials: "I",
    firebaseUid: "UinAtRp5gDN8UkZViXboCCqb3852",
  },
  {
    username: "ismael",
    name: "Ismael",
    email: "ismael@web.com",
    password: "",
    initials: "I",
    firebaseUid: "TXEkIjCP7XPFtUiqwrjAHSqQqcC3",
  },
  {
    username: "mariano",
    name: "Mariano",
    email: "mariano@web.com",
    password: "",
    initials: "M",
    firebaseUid: "4xCpvexP0LgMN5MU4z9ZiNyTIyE3",
  },
];

async function seed() {
  await mongoose.connect(process.env.COSMOS_CONNECTION_STRING);
  console.log("Conectado a Cosmos DB");

  for (const userData of users) {
    const exists = await User.findOne({ firebaseUid: userData.firebaseUid });
    if (exists) {
      console.log(`  Ya existe: ${userData.email} (id: ${exists.id})`);
      continue;
    }
    const user = await User.create(userData);
    console.log(`  Creado: ${userData.email} → id: ${user.id}`);
  }

  await mongoose.disconnect();
  console.log("Seed completado.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
