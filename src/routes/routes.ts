import { Router } from "express";
import * as service from "../services"

const router = Router();

// ----tenant-----
router.post("/create-tenant", service.createTenant); // create tenant
router.get("/get-tenant/:id", service.getTenant); // get tenant info


// admin routes
router.post("/admin/create-admin", service.authenticateToken, service.checkIfAdmin, service.createAdmin);
router.post("/admin/create-owner", service.authenticateToken, service.checkIfAdmin, service.createOwner);

// ----product-----
router.post("/product/add", service.authenticateToken, service.addProduct); // add product
router.patch("/product/update", service.authenticateToken, service.updateProduct); // update product
router.delete("/product/delete", service.authenticateToken, service.deleteProduct); // delete a product
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
router.patch("/customer/update", service.authenticateToken, service.updateUser); // update user
router.get("/customer/history/:page", service.authenticateToken, service.getHistory); // get order history
router.get("/customer/order-detail/:id", service.authenticateToken, service.getOrderDetail) // get specific order detail
router.post("/customer/add-address", service.authenticateToken, service.addAddress); // add user address

router.post("/customer/add-to-cart", service.authenticateToken, service.addToCart); // add product to cart
router.post("/customer/place-order", service.authenticateToken, service.placeOrder); // place order
router.post("/customer/cancel-order", service.authenticateToken, service.cancelOrder); // cancel order


router.get("/admin/get-most-ferq-product", service.mostFreqOrderedProduct)

export default router;
