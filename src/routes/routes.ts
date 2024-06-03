import { Router } from "express";
import * as service from "../services"

const router = Router();

// ----tenant-----
router.post("/create-tenant", service.createTenant); // create tenant
router.get("/get-tenant/:id", service.getTenant); // get tenant info


// update tenant info

// ----product-----
router.post("/product/add", service.addProduct); // add product
router.patch("/product/update", service.updateProduct); // update product
router.delete("/product/delete", service.deleteProduct); // delete a product
router.get("/product/get-all", service.getAllProduct); // get all products
router.get("/product/get/:id", service.getProduct); // get specific product
router.post("/product/search", service.searchProduct); // search product

// update product info
// list products
// search products via on category, name


// ----customer---
// create user
router.post("/customer/signup", service.signUp); // create user
router.post("/customer/sign-in", service.signIn); // login user
router.patch("/customer/update", service.updateUser); // update user
router.get("/customer/history/:page", service.getHistory); // get order history
router.get("/customer/order-detail/:id", service.getOrderDetail) // get specific order detail
router.post("/customer/add-address", service.addAddress); // add user address

router.post("/customer/add-to-cart", service.addToCart); // add product to cart
router.post("/customer/place-order", service.placeOrder); // place order
router.post("/customer/cancel-order", service.cancelOrder); // cancel order


export default router;
