const{Product,Category,Color,Size}=require('../../database/models');

const fs = require('fs');
const path=require('path');
const { Op } = require("sequelize");

const controller={


	productsList:async (req,res)=>{
		
		const category=req.params.categoryId;
		const productsList= await Product.findAll({
			
			where:{
				categoryId: Number(category)
			}
		});
		res.render("../views/products/productsList",{productsList})
	},

	productDetail: async (req, res) => {
		const productID = req.params.id;
		const productDetail = await Product.findByPk(productID, { include: ["size", "category",'color'] });
		
		return res.render("../views/products/productDetail2", { productDetail });
		
	},

	createProduct: async (req,res) => {
		try{
			const size = await Size.findAll({});
			const colors = await Color.findAll({});
			const categories = await Category.findAll({});

			for (let i = 0; i< colors.length; i++){
				colors[i].name = colors[i].name.split("").slice(1).join("")
			}
			res.render("../views/products/createProduct",{category : categories, color : colors, size : size})
		}catch (err) {
			console.log(err)
		}
	},
	add :async (req, res) => {
		try{
			let a = Object.keys(req.body).filter((element)=>{
				return element.length<=2
			}) 
			for ( let i = 0;  i <a.length;i++){
				a[i] = a[i].split("").slice(1).join("")
			}
			const newProduct = await Product.create({
				name: req.body.productName,
				price: req.body.productPrice,
				discount: req.body.productDiscount,
				description: req.body.productDescription,
				quantity: 10,
				image1: req.files.image1? req.files.image1[0].filename : "default-image.png",
				image2: req.files.image2? req.files.image2[0].filename : "default-image.png",
				image3: req.files.image3? req.files.image3[0].filename : "default-image.png",
				image4: req.files.image4? req.files.image4[0].filename : "default-image.png",
				categoryId: req.body.category
			});
			await newProduct.addColor(a)
			await newProduct.addSize(req.body.size)
			return res.redirect("/") 
		}catch (err) {
			console.log(err)
		}
	}, 

	editProduct:async(req,res)=>{
		let requestProduct= await Product.findByPk(req.params.id, { include: ["size", "category",'color'] });
		//return res.json(requestProduct)
		let requestCategories= await Category.findAll();
		let requestSizes = await Size.findAll();
		let requestColors = await Color.findAll();
		for (let i = 0; i< requestColors.length; i++){
			requestColors[i].name = requestColors[i].name.split("").slice(1).join("")
		}
		return res.render('../views/products/editProduct2',{product:requestProduct,category:requestCategories,size:requestSizes,color:requestColors})
	},
	update : async(req,res)=>{
		try{
			let product = await Product.findByPk(req.params.id,{include:["size", "color"]});	
			
			let a = Object.keys(req.body).filter((element)=>{
				return element.length<=2
			}) 
			for ( let i = 0;  i <a.length;i++){
				a[i] = a[i].split("").slice(1).join("")
			}

			
			product.name = req.body.productName?req.body.productName:product.name;
			product.price = req.body.productPrice?req.body.productPrice:product.price;
			product.discount = req.body.productDiscount?req.body.productDiscount:product.discount;
			product.description = req.body.productDescription?req.body.productDescription:product.description;
			product.categoryId = req.body.category?req.body.category:product.categoryId;
			product.quantity = product.quantity;
			product.image1 = req.files.image1? req.files.image1[0].filename :product.image1;
			product.image2 = req.files.image2? req.files.image2[0].filename :product.image2;
			product.image3 = req.files.image3? req.files.image3[0].filename :product.image3;
			product.image4 = req.files.image4? req.files.image4[0].filename :product.image4
			
			if(a.length != 0){
				await product.removeColor(product.color);
				await product.addColor(a);
			}
			if(req.body.size){
				await product.removeSize(product.size);
				await product.addSize(req.body.size);
			}
			
			product.save();
			res.redirect("/products/detail/"+ req.params.id)
/* 
			console.log(a)
			const updateProduct = await Product.update({
				name: req.body.productName,
				price: req.body.productPrice,
				discount: req.body.productDiscount,
				description: req.body.productDescription,
				quantity: 10,
				image1: req.files.image1? req.files.image1[0].filename : "default-image.png",
				image2: req.files.image2? req.files.image2[0].filename : "default-image.png",
				image3: req.files.image3? req.files.image3[0].filename : "default-image.png",
				image4: req.files.image4? req.files.image4[0].filename : "default-image.png",
				categoryId: req.body.category
			},{
				where:{
					id: req.params.id
				}
			});
			await updateProduct.addColor(a)
			await updateProduct.addSize(req.body.size)
			res.redirect('../views/products/detail/'+ req.params.id) */
		}catch (err) {
			console.log(err)
		}

	},
	productCart:(req,res)=>{
        return res.render("../views/products/productCart")
    },

	search: (req, res) => {
		const productToSearch=req.query.search;
		// return res.json({productToSearch});
		Product.findAll({

			
			where: {
				name: { 
				[Op.like] : `%${productToSearch}%`
				}
			}, include:['category'],
		})
		
		.then(product => {
			// return res.json(product);
			let searchArray = [];
			for ( let i = 0;  i < product.length; i++) {
				searchArray.push(product[i]);
			}
			if ( searchArray.length == 0 ) {
			res.redirect('/');
			} else {
				
			res.render('./products/productSearch', { searchArray });
			}
		})
		.catch(error => {
			return res.send(error);
		})


	},
	delete: async(req,res) =>{
		const productId= req.params.id;
		await Product.destroy({where: {id:productId}});
		return res.redirect('/')


	}
}

module.exports = controller