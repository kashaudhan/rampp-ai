import { Request, Response } from "express";
import * as models from "../models";
import * as validator from "../utils/validator";


export const signUp = async (req: Request, res: Response) => {
  let { name, email, tenant_id } = req.body;

  tenant_id = Number(tenant_id)

  if (
    !validator.emailValidation(email) ||
    !name.trim().length ||
    tenant_id === 0
  ) {
    return res
      .status(400)
      .json({
        error: "Please provide valid email & name",
      })
      .end();
  }

  try {
    await models.db.run(
      `
        INSERT INTO user(name, email, tenant_id, user_type)
        VALUES($1, $2, $3, "CUSTOMER")
    `,
      [name, email, Number(tenant_id)]
    );

    return res
      .status(200)
      .json({
        message: "User created successfully!",
      })
      .end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export const signIn = async (req: Request, res: Response) => {
  // const user_id = req.body
}
export const updateUser = async (req: Request, res: Response) => {
  const user_id = Number(req.params['userId']);
  let { name, email } = req.body;

  if(user_id <= 0) {
    res.status(400).json({
      error: "Invalid user id"
    });
  }

  if(name.trim().length <= 0 || !validator.emailValidation(email)) {
    return res.status(400).json({
      error: "Invalid email or name provided"
    }).end();
  }

  try {
    await models.db.run(`UPDATE user SET name = $1, email = $2 WHERE id = $3`, [name, email, user_id]);

    return res.status(200).json({
      message: "User updated successfully"
    });
  } catch (error) {
    return res.status(500).end();
  }
}

/**
 * Only admins can create a admin
 */
export const createAdmin = async (req: Request, res: Response) => {
  let { admin_id, name, email, tenant_id,  } = req.body

  admin_id = Number(admin_id);
  tenant_id = Number(tenant_id);
  name = name.trim();

  if(admin_id <= 0 ||tenant_id <= 0 || name.length <= 0 || !validator.emailValidation(email)) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  try {
    const result = await models.db.get(`SELECT EXISTS(SELECT 1 FROM user where email = $1 AND user_type = 'ADMIN')`, [email])
    if(result.exists) {
      return res.status(409).json({
        error: "User with provided email already exists"
      }).end();
    }
    await models.db.run(
      `INSERT INTO user (name, user_type, email, tenant_id) VALUES($1, $2, $3, $4)`, 
      [name, 'ADMIN', email, tenant_id]
    );
    
    return res.status(201).json({
      message: "Admin created successfully"
    }).end();
  } catch (error) {
    return res.status(500).end();
  }
}


/**
 * Only admins can create a owner
 */
export const createOwner = async (req: Request, res: Response) => {
  let { admin_id, name, email, tenant_id,  } = req.body

  admin_id = Number(admin_id);
  tenant_id = Number(tenant_id);
  name = name.trim();

  if(admin_id <= 0 ||tenant_id <= 0 || name.length <= 0 || !validator.emailValidation(email)) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  try {
    const result = await models.db.get(`SELECT EXISTS(SELECT 1 FROM user where email = $1 AND user_type = 'ADMIN')`, [email])
    if(result.exists) {
      return res.status(409).json({
        error: "User with provided email already exists"
      }).end();
    }
    await models.db.run(
      `INSERT INTO user (name, user_type, email, tenant_id) VALUES($1, $2, $3, $4)`, 
      [name, 'OWNER', email, tenant_id]
    );
    
    return res.status(201).json({
      message: "Owner created successfully"
    }).end();
  } catch (error) {
    return res.status(500).end();
  }
}