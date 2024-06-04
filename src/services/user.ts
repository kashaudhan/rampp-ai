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