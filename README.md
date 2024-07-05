# Sona Bikes API

This is a Node.js application that serves as an API for Sona Bikes, interfacing with Shopify to retrieve and transform order data.

## Prerequisites

- Docker
- Access to Shopify API (API key and Access token)

## Setup

1. Run the command:

   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   SHOPIFY_API_KEY=your_shopify_api_key
   SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
   PORT=5000
   ```
   Replace `your_shopify_api_key` and `your_shopify_access_token` with your actual Shopify API credentials.

## Running the Application

### Using Docker

1. Start the Docker application

2. Build the Docker image:

   ```
   docker build -t sonabikes-api .
   ```

3. Run the Docker container:
   ```
   docker run -p 5001:5000 --env-file .env --name sona_api sonabikes-api
   ```

The API will be available at `http://localhost:5001`.

## API Endpoints

### Get Order

- **URL**: `/api/orders`
- **Method**: GET
- **Query Parameters**:
  - `oid`: Order ID in the format SONA-XXXX-YYYY
- **Success Response**:
  - **Code**: 200
  - **Content**: JSON object containing order details
- **Error Response**:

  - **Code**: 400
  - **Content**: `{ "status": false, "message": "Invalid order ID format" }`

  OR

  - **Code**: 500
  - **Content**: `{ "status": false, message: "Error fetching order from Shopify" }`

## Deployment

To deploy this application:

1. Build the Docker image:

   ```
   docker build -t sonabikes-api .
   ```

2. Save the Docker image:

   ```
   docker save sonabikes-api > sonabikes-api.tar
   ```

3. Transfer the `sonabikes-api.tar` file to your server.

4. On the server, load the Docker image:

   ```
   docker load < sonabikes-api.tar
   ```

5. Run the Docker container:
   ```
   docker run -p 80:5000 -e PORT=5000 --env-file .env sonabikes-api
   ```

## Troubleshooting

- If you encounter any issues with the Shopify API, check your API credentials in the `.env` file.
- Make sure the required ports (5000 for the application, 80 for external access) are open on your server.
- Check the application logs for any error messages:
  ```
  docker logs sona_api
  ```

## Support

For any questions or issues, please contact our support team at support@sonabikes.com.
