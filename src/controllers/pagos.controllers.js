 
import  sql  from "mssql";
import { getConnection } from "../database/connection.js";


export const getPago = async (req, res) => {
  try {
    const { fechai, fechaf } = req.params;
     const desde = new Date(fechai);
    const hasta = new Date(fechaf); 
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("desde", desde)
      .input("hasta", hasta)
      .execute("Jsweb_sp_consultar_recibos_pagos");
   
    // El resultado del procedimiento almacenado estará en result.recordset
    

    // Envía el resultado como respuesta JSON
    res.json(result.recordset);
  } catch (error) {
    // Manejar errores si hay algún problema con la ejecución del procedimiento almacenado
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};
export const getMeta = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .execute("S_RECAUDACION.sp_obtener_avance_meta_mef");
   
        // Envía el resultado como respuesta JSON
    res.json(result.recordset);
  } catch (error) {
    // Manejar errores si hay algún problema con la ejecución del procedimiento almacenado
    console.error(error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};