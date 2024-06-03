import { Request, Response } from "express";
import * as models from "../models";

export const createTenant = async (req: Request, res: Response) => {
  let { name } = req.body;

  name = name.trim()

  if (!name || name.length <= 3) {
    return res
      .status(400)
      .json({
        error: "Name must be contain at least 3 characters",
      })
      .end();
  }

  console.log("Name: ", name)

  try {
    await models.db.run(`INSERT INTO tenant(name) VALUES(?)`, [name]);

    return res
      .status(200)
      .json({
        message: "Tenant created successfully!",
      })
      .end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export const getTenant = async (req: Request, res: Response) => {

  const id = Number(req.params['id'])

  if(id <= 0) {
    return res
      .status(400)
      .json({
        error: "Invalid tenant id provided",
      })
      .end();
  }

  try {
    const data = await models.db.get(`SELECT * from tenant WHERE id = ?`,[id]);

    return res
      .status(200)
      .json({
        data,
      })
      .end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};