import { Request, Response } from "express";
import * as models from "../models"
import * as constants from "../constants"

export const getHistory = async (req: Request, res: Response) => {
  let { user_id, tenant_id } = req.body;
  let page = Number(req.params['id']);

  user_id = Number(user_id);
  tenant_id = Number(tenant_id);

  if(page < 1 || user_id <= 0 || tenant_id <= 0) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    });
  }

  try {
    const result = await models.db.all(
      `
      SELECT
        p.name AS product_name,
        p.category AS product_category,
        olp.price AS product_price,
        olp.quantity AS quantity,
        o.address AS address,
        o.order_amount AS total_amount,
        FROM orders o 
        JOIN order_link_product olp ON olp.order_id = o.id 
        JOIN product p ON p.id = olp.product_id 
      WHERE o.user_id = $1
      ORDER BY o.creation_time DESC
      LIMIT $2 OFFSET $3
      `,
      [user_id, constants.PAGE_SIZE, constants.PAGE_SIZE * (page - 1)])
  } catch (error) {
    
  }

}

export const getOrderDetail = async (req: Request, res: Response) => {
  let order_id = Number(req.params['orderId']);

  if(order_id <= 0) {
    return res.status(400).json({
      error: "Invalid order id"
    }).end();
  }

  try {
    const result = await models.db.all(
      `
      SELECT
        p.name AS product_name,
        p.category AS product_category,
        olp.price AS product_price,
        olp.quantity AS quantity,
        o.address AS address,
        o.order_amount AS total_amount,
        FROM orders o 
        JOIN order_link_product olp ON olp.order_id = o.id 
        JOIN product p ON p.id = olp.product_id 
      WHERE o.id = $1
      ORDER BY o.creation_time DESC
      `, [order_id])

      return res.status(200).json({
        data: result
      }).end();
  } catch (error) {
    return res.status(500).end();
  }
}

export const addAddress = async (req: Request, res: Response) => {
  let { address, user_id } = req.body;

  address = address.trim();
  user_id = Number(user_id)

  if(!address.length || user_id <= 0) {
    return res.status(400).json({
      error: "Empty address"
    });
  }

  try {
    await models.db.run(`INSERT INTO address (user_id, address) VALUES ($1, $2)`, [user_id, address]);
    return res.status(200).json({
      message: "Address added successfully"
    }).end();
  } catch (error) {
    return res.status(500).end();
  }

}

export const addToCart = async (req: Request, res: Response) => {
  let { product_id, quantity, user_id } = req.body;

  product_id = Number(product_id);
  user_id = Number(user_id);

  if(product_id <= 0 || user_id <= 0) {
    return res.status(400).json({
      error: "Invalid product"
    }).end();
  }

  try {

    const productInfo = await models.db.get(`SELECT * FROM product WHERE id = $1 AND is_deleted = FALSE`, [product_id]);

    if(productInfo.quantity < quantity) {
      return res.status(400).json({
        error: "Quantity greater than available quantity"
      });
    }

    await models.db.run(`
      INSERT INTO cart(quantity, product_id, user_id) VALUES($1, $2, $3)
    `, [quantity, product_id, user_id]);

    return res.status(201).json({
      message: "Product added to cart"
    }).end();
  } catch (error) {
    return res.status(500).end();
  }

}

export const getCart = async (req: Request, res: Response) => {
  let { user_id } = req.body;

  user_id = Number(user_id);

  if(user_id <= 0) {
    return res.status(400).json({
      error: "Invalid user"
    });
  }

  try {
    const result = await models.db.all(`SELECT * FROM cart WHERE user_id = $1`, [ user_id ]);

    return res.status(200).json({
      data: result
    }).end();
  } catch (error) {
    return res.status(500).end();
  }

};
export const placeOrder = async (req: Request, res: Response) => {
  let user_id = Number(req.params['user_id'])

  user_id = Number(user_id)

  if(user_id <= 0) {
    return res.status(400).json({
      error: "Invalid user"
    });
  }
  
  try {
    // models.db.migrate
    // get all items from cart
    await models.db.run(`BEGIN TRANSACTION`);
    const cart = await models.db.all(`SELECT * FROM cart WHERE user_id = $1`, [user_id]);
    let totalAmount = 0;
    cart.forEach(product => {
      totalAmount += product.price * product.quantity
    });
    // insert all those cart items into order_link_product
    // insert order detail in order table
    // remove all item from cart
    await models.db.run(`COMMIT TRANSACTION`);
  } catch (error) {
    await models.db.run(`ROLLBACK TRANSACTION`)
  }

}
export const cancelOrder = async (req: Request, res: Response) => {
  let order_id = Number(req.params['orderId']);

  if(order_id <= 0) {
    return res.status(400).json({
      error: "Invalid order id"
    })
  }

  try {
    const result = await models.db.get(`UPDATE order SET status = 'CANCELED' WHERE id = $1 AND status <> 'DELIVERED'`, [order_id]);
    if(!result) {
      return res.status(400).json({
        error: "Unable to cancel order"
      }).end();
    }

    return res.status(200).json({
      message: "Order canceled"
    });

  } catch (error) {
    return res.status(500).end();
  }


}


/**
 * select
 * p.name as product_name,
 * p.category as product_category,
 * olp.price as product_price,
 * olp.quantity as quantity,
 * o.address as address,
 * o.order_amount as total_amount,
 * from orders o 
 * JOIN order_link_product olp on olp.order_id = o.id 
 * JOIN product p ON p.id = olp.product_id 
 * where o.user_id = p1
 * 
 */