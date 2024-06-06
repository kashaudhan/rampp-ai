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

export const updateProduct = async (req: Request, res: Response) => {
  let { id, category, price, quantity, name, is_deleted } = req.body;

  id = Number(id);
  price = Number(price);
  quantity = Number(quantity);
  is_deleted = Boolean(is_deleted);

  if(id <= 0 || price < 0 || quantity < 0 || category) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }
  try {
    await models.db.run(
      `UPDATE product 
        SET 
          price = $2,
          quantity = $3,
          category = $4,
          name = $5,
          is_deleted = $6
        WHERE id = $1 `, [id, price, quantity, category, name, is_deleted]);
      return res
        .status(200)
        .json({
          "message": "Updated product successfully!",
        })
        .end();

  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }

}

export const deleteProduct = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);

  if(id <= 0) {
    return res.status(400).json({
      error: "Invalid product id"
    }).end();
  }

  try {
    await models.db.run(`UPDATE product SET is_deleted = FALSE WHERE id = $1`, [id])
    return res.status(200).json({
      message: "Product deleted successfully"
    }).end();
  } catch (error) {
    return res.status(500).end();
  }

}

export const getAllProduct = async (req: Request, res: Response) => {
  const tenant_id = 0

  if(tenant_id <= 0) {
    return res.status(400).json({
      error: "Invalid tenant id"
    }).end();
  }
  try {
    const result = models.db.all(`SELECT * FROM product WHERE tenant_id = $1 AND is_deleted = FALSE`, [tenant_id])
  } catch (error) {
    
  }
}

export const searchProduct = async (req: Request, res: Response) => {
  let { name, min_price, max_price, category, tenant_id } = req.body;

  tenant_id = Number(tenant_id);
  min_price = Number(min_price) ? Number(min_price) : 0;
  max_price = Number(max_price) ? Number(max_price) : Number.MAX_VALUE;

  if(tenant_id <= 0 || !Array.isArray(category)) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  const placeholders = category.map(() => '?').join(', ');

  try {
    const result = models.db.all(
      `SELECT * FROM product 
        WHERE id_deleted = FALSE AND 
          name LIKE ? AND
          price >= ? AND
          price <= ? AND
          tenant_id = ?
          category IN(${placeholders})`
      , [name, min_price, max_price, tenant_id, ...category])

      return res.status(200).json({
        data: result
      }).end();
  } catch (error) {
    return res.status(500).end();
  }

}


export const mostFreqOrderedProduct = async (req: Request, res: Response) => {
  try {
    const result = await models.db.run(`
      SELECT tenant_id, product_id from product GROUP BY tenant_id
    `)

    // console.log("Rsu")
  } catch (error) {
    
  }
}

/**
 * t1- p1, p2, p2 p1, p2
 * t2- p1, p2, p2 p1, p2
 * 
 * t1- > p1-2 p2-3
 * 
 * [{ 1, 2 }, {2, 2}]
 */

/**
 * 1 - apple
 * 2 - orange
 * 3 - apple + orange
 * 
 * All labels are wrong
 */

/**
 * Redis -> 
 * user_id, ip_address
 * 
 * ip_address
 * ip_address -> key
 */