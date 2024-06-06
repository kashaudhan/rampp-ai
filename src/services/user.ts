import { Request, Response } from "express";
import * as models from "../models";
import * as validator from "../utils/validator";
import bcrypt from "bcryptjs";
import * as type from "../types"
import * as auth from "./auth"


export const signUp = async (req: Request, res: Response) => {
  let { name, email, tenant_id, password } = req.body;

  tenant_id = Number(tenant_id)

  if (
    !name.trim().length ||
    tenant_id === 0 ||
    !password.length ||
    !validator.emailValidation(email) ||
    !validator.passwordValidation(password)
  ) {
    return res
      .status(400)
      .json({
        error: "Invalid value(s) provided",
      })
      .end();
  }

  try {
    const salt = bcrypt.genSaltSync(Number(process.env.ENCRYPTION_SALT));
    const passwordHash = bcrypt.hashSync(password, salt);

    await models.db.run(
      `
        INSERT INTO user(name, email, tenant_id, user_type, password_hash)
        VALUES($1, $2, $3, "CUSTOMER", $4)
    `,
      [name, email, Number(tenant_id), passwordHash]
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
  const { email: emailId = "", password = "" } = req.body;

  if (!emailId.trim() || !password.trim()) {
    return res
      .status(403)
      .json({
        error: "Email or password not provided",
      })
      .end();
  }

  try {
    const result = await models.db.get(`SELECT id, email, tenant_id, password_hash, name, user_type from user WHERE email = $1`,[emailId]);
    if (!result) {
      return res
        .status(401)
        .json({
          error: "Invalid email provided",
        })
        .end();
    }
    const isPasswordValid = bcrypt.compareSync(
      password,
      result.password_hash
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({
          error: "Email or password is invalid",
        })
        .end();
    }

    const token = await auth.signJwtAndReturnToken({ 
      id: result.id,
      name: result.name,
      email: result.email,
      tenant_id: result.tenant_id,
      user_type: result.user_type
    });

    console.log("")

    return res
      .status(200)
      .json({
        name: result.name,
        email: result.email,
        user_type: result.user_type,
        tenant_id: result.tenant_id,
        token: token,
      })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Something went wrong",
      })
      .end();
  }

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
  let { id } = (req as any).user;
  let { name, email, tenant_id, password } = req.body;


  id = Number(id);
  tenant_id = Number(tenant_id);
  name = name.trim();

  if(id <= 0 ||tenant_id <= 0 || name.length <= 0 || !validator.emailValidation(email) || validator.passwordValidation(password)) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  try {
    const result = await models.db.get(`SELECT EXISTS(SELECT 1 FROM user where email = $1)`, [email])
    if(result.exists) {
      return res.status(409).json({
        error: "User with provided email already exists"
      }).end();
    }
    const salt = bcrypt.genSaltSync(Number(process.env.ENCRYPTION_SALT));
    const passwordHash = bcrypt.hashSync(password, salt);
    await models.db.run(
      `INSERT INTO user (name, user_type, email, tenant_id, password_hash) VALUES($1, $2, $3, $4)`, 
      [name, 'ADMIN', email, tenant_id, passwordHash]
    );
    
    return res.status(201).json({
      message: "Admin created successfully"
    }).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
}


/**
 * Only admins can create a owner
 */
export const createOwner = async (req: Request, res: Response) => {
  let { id, name, email, tenant_id, user_type } = req.body.user

  if(user_type !== type.UserType.ADMIN) {
    return res.status(401).json({
      error: "Unauthorized"
    }).end();
  }

  id = Number(id);
  tenant_id = Number(tenant_id);
  name = name.trim();

  if(id <= 0 ||tenant_id <= 0 || name.length <= 0 || !validator.emailValidation(email)) {
    return res.status(400).json({
      error: "Invalid value(s) provided"
    }).end();
  }

  try {
    const result = await models.db.get(`SELECT EXISTS(SELECT 1 FROM user where email = $1)`, [email])
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