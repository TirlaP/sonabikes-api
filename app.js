require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const shopifyApiUrl = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_ACCESS_TOKEN}@sonabikes.myshopify.com/admin/api/2024-07`;
// From the CSV file
const bikeColours = {
	blue: 1,
	red: 2,
	yellow: 3,
	green: 4,
	orange: 5,
	purple: 6,
	black: 7,
	white: 8,
	grey: 9,
	silver: 10,
	pink: 11,
};

// From the CSV file
const bikeSizes = {
	small: 1,
	medium: 2,
	large: 3,
	"x large": 4,
	"48cm": 5,
	"50cm": 6,
	"52cm": 7,
	"54cm": 8,
	"56cm": 9,
	"58cm": 10,
	"60cm": 11,
	unisize: 12,
};

// From the CSV file
const bikeTypes = {
	"Regular bike": 1,
	"Electric bike": 2,
	"Cargo or electric cargo bike": 3,
};

// From the CSV file
const categories = {
	Helmet: 1,
	Lock: 2,
	Lights: 3,
	Mudguards: 4,
	"Panniers and luggage carriers": 5,
	"Reflective Clothing": 6,
	Pump: 7,
	Bell: 8,
	Mirror: 9,
	"Cycle clips": 10,
	"Repair kits": 11,
	Accessories: 12,
	Reflectors: 13,
};

function getBikeColourId(colour) {
	return bikeColours[colour?.toLowerCase()] || 1; // Default to 1 if not found
}

function getBikeSizeId(size) {
	return bikeSizes[size?.toLowerCase()] || 12; // Default to Unisize if not found
}

function getBikeTypeId(name) {
	if (name?.toLowerCase().includes("electric")) return 2;
	if (name?.toLowerCase().includes("cargo")) return 3;
	return 1; // Default to Regular bike
}

function getCategoryId(name) {
	for (const [category, id] of Object.entries(categories)) {
		if (name?.toLowerCase().includes(category.toLowerCase())) {
			return id;
		}
	}
	return 12; // Default to Accessories if not found
}

function transformOrderData(order) {
	try {
		let bike = null;
		const accessories = [];

		for (const item of order.line_items) {
			if (
				!bike &&
				(item.title?.toLowerCase().includes("bike") ||
					item.title?.toLowerCase().includes("package"))
			) {
				let size = "";
				let colour = "";
				if (item.variant_title) {
					const parts = item.variant_title.split(" / ");
					size = parts[0];
					colour = parts[1];
				}
				bike = {
					model: item.title,
					price: Math.round(parseFloat(item.price)),
					bike_type_id: getBikeTypeId(item.title),
					bike_colour_id: getBikeColourId(colour),
					brand_id: 317,
					bike_size_id: getBikeSizeId(size),
				};
			} else if (
				!item.title?.toLowerCase().includes("bike") &&
				!item.title?.toLowerCase().includes("package")
			) {
				accessories.push({
					category: "Accessory",
					category_id: getCategoryId(item.title),
					description: item.title,
					quantity: item.quantity.toString(),
					price: Math.round(parseFloat(item.price)),
				});
			}
		}

		return {
			status: true,
			bike: bike,
			accessories: accessories,
		};
	} catch (error) {
		console.error("Error in transformOrderData:", error);
		return {
			status: false,
			error: "Error processing order data",
		};
	}
}

app.get("/api/orders", async (req, res) => {
	const { oid } = req.query;

	if (!oid || !oid.startsWith("SONA-")) {
		return res
			.status(400)
			.json({ status: false, message: "Invalid order ID format" });
	}

	const [_, orderNumber, randomNumber] = oid.split("-");

	try {
		const response = await axios.get(`${shopifyApiUrl}/orders.json`, {
			params: {
				name: `#${orderNumber}`,
				status: "any",
				fields: "id,line_items,name,total_price",
			},
		});

		const orders = response.data.orders;

		if (orders.length === 0) {
			return res.json({ status: false });
		}

		const order = orders[0];
		const transformedOrder = transformOrderData(order);
		res.json(transformedOrder);
	} catch (error) {
		console.error(
			"Shopify API error:",
			error.response ? error.response.data : error.message
		);
		res
			.status(error.response?.status || 500)
			.json({ status: false, message: "Error fetching order from Shopify" });
	}
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Sona Bikes API running on port ${port}`);
});
