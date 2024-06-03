import { Request, Response } from "express";
import * as models from "../models";


export const addProduct = async (req: Request, res: Response) => {
  let {category, price, quantity, name, tenant_id} = req.body;

  quantity = Number(quantity);
  price = Number(price)
  tenant_id = Number(tenant_id);

  if(!category || price <= 0 || quantity < 0 || !name.trim().length || tenant_id <= 0) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  try {
    await models.db.run(`
      INSERT INTO product(category, price, quantity, name, tenant_id) VALUES($1, $2, $3, $4, $5)
    `, 
    [category, price, quantity, name, tenant_id]);
  } catch (error) {
    
  }
}

export const getProduct = async (req: Request, res: Response) => {

  const id = Number(req.params['id'])
  const tenant_id = Number()

  try {
    const result = await models.db.run(`SELECT id, price, quantity, category, name from product WHERE is_deleted <> false AND id = $1 `, [id]);
    return res
      .status(200)
      .json({
        data: result,
      })
      .end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export const updateProduct = async (req: Request, res: Response) => {}

export const deleteProduct = async (req: Request, res: Response) => {}

export const getAllProduct = async (req: Request, res: Response) => {}

export const searchProduct = async (req: Request, res: Response) => {}
