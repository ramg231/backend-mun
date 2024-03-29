import sql from "mssql";
import { config } from 'dotenv';
config();
const dbSettings = {
  user:'sa',
  password:'Sistemas2023*',
  server:'38.43.133.252',
  database:'SistemaIntegralMunicipal',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (error) {
    console.error(error);
  }
};
