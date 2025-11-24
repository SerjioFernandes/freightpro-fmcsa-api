# MongoDB Connection Guide

## How to Connect to MongoDB Atlas with MongoDB Compass

### Step 1: Get Your Connection String

Your MongoDB connection string should be in this format:
```
mongodb+srv://<username>:<password>@cargolume.cnjx97m.mongodb.net/<database-name>?retryWrites=true&w=majority
```

### Step 2: Find Your Connection String

1. **From Railway Environment Variables:**
   - Go to Railway dashboard → Your project → Variables
   - Copy the `MONGODB_URI` value
   - It should look like: `mongodb+srv://username:password@cargolume.cnjx97m.mongodb.net/dbname?retryWrites=true&w=majority`

2. **From MongoDB Atlas:**
   - Go to MongoDB Atlas → Clusters → Connect
   - Click "Connect with MongoDB Compass"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 3: Connect with MongoDB Compass

1. Open MongoDB Compass
2. Paste your connection string in the connection field
3. Make sure to replace `<password>` with your actual password if it's not already replaced
4. Click "Connect"

### Step 4: If Connection Fails

**Common Issues:**

1. **IP Address Not Whitelisted:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your current IP address (or use `0.0.0.0/0` to allow all IPs - less secure)
   - Wait 1-2 minutes for changes to propagate

2. **Wrong Username/Password:**
   - Go to MongoDB Atlas → Database Access
   - Check your username
   - Reset password if needed
   - Update the connection string with correct credentials

3. **Connection String Format:**
   - Make sure there are no extra spaces
   - Make sure special characters in password are URL-encoded
   - Example: If password is `p@ssw0rd`, it should be `p%40ssw0rd` in the connection string

### Step 5: Test Connection

Once connected, you should see:
- Your database name
- Collections (users, loads, shipments, etc.)
- Data in collections

### Quick Connection String Format

```
mongodb+srv://<USERNAME>:<PASSWORD>@cargolume.cnjx97m.mongodb.net/<DATABASE_NAME>?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://admin:MyPassword123@cargolume.cnjx97m.mongodb.net/cargolume?retryWrites=true&w=majority
```

### Security Note

- Never share your connection string publicly
- Use strong passwords
- Whitelist only necessary IP addresses
- Consider using MongoDB Atlas IP Access List for better security

